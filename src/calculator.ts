import block from './block.js'
import labeledInput from './calculatorElements/labeledInput.js'

const { StyleSheet, css } = aphrodite

const styles = StyleSheet.create({
  flex: {
    display: 'flex',
  },
  radios: {},
  radioLabel: {
    display: 'block',
  },
  pitStopLabel: {
    display: 'inline-block',
    minWidth: '130px',
  },
  resultPanel: {
    marginLeft: '20px',
    paddingLeft: '20px',
    borderLeft: '1px solid silver',
  },
})

enum RaceLengthType {
  Laps = 'Laps',
  TimeForEnd = 'TimeForEnd',
  TimeForLastLap = 'TimeForLastLap',
}

interface Stint {
  stopAtStartOf: number
  nextStopAtStartOf: number | null
  addFuel: number
  totalFuel: number
  totalFuelAtEnd: number
  fuelChecks: number[]
}

export default Vue.component('calculator', {
  components: { block, labeledInput },
  data: () => ({
    fuelPerLap: 10,
    lapTime: 90,
    pitStopTimeLoss: 40,
    raceLengthType: RaceLengthType.Laps,
    raceLength: 50,
    minimumFuel: 5,
    maximumFuel: 999,
    pitStops: 0,
    pitStopsAt: [50, 66],
    minimumFuelAdjustment: 1,
    raceLengthInputLabels: {
      Laps: 'Laps',
      TimeForEnd: 'Time',
      TimeForLastLap: 'Time',
    },
  }),
  watch: {
    pitStops: function (newPitStops) {
      if (newPitStops === 1) {
        this.pitStopsAt = [50, 50]
      } else {
        this.pitStopsAt = [33, 66]
      }
    },
  },
  computed: {
    results() {
      const totalLaps = this.estimatedLaps
      const stints: Stint[] = [...this.pitStopsAt.slice(0, this.pitStops), 100].reduce((agg, item) => {
        const nextStopLap = Math.round((totalLaps * item) / 100)
        const previous: Stint = agg[agg.length - 1] ?? {
          nextStopAtStartOf: 0,
          addFuel: 0,
          totalFuel: 0,
          totalFuelAtEnd: 0,
          stopAtStartOf: 0,
          fuelChecks: [],
        }
        const fuelRemaining = previous.totalFuelAtEnd
        const fuelNeededForStint = (nextStopLap - previous.nextStopAtStartOf!) * this.fuelPerLap
        const additionalFuelNeeded = fuelNeededForStint - fuelRemaining + this.minimumFuel
        const roundedAdditionalFuel =
          Math.ceil(additionalFuelNeeded / this.minimumFuelAdjustment) * this.minimumFuelAdjustment
        const newTotalFuel = fuelRemaining + roundedAdditionalFuel
        const totalFuelAtEnd = newTotalFuel - fuelNeededForStint

        return [
          ...agg,
          {
            stopAtStartOf: previous.nextStopAtStartOf ?? 0,
            nextStopAtStartOf: item !== 100 ? nextStopLap : null,
            addFuel: roundedAdditionalFuel,
            totalFuel: newTotalFuel,
            totalFuelAtEnd,
            fuelChecks: [
              fuelRemaining,
              previous.totalFuelAtEnd + this.fuelPerLap,
              previous.totalFuelAtEnd + this.fuelPerLap * 2,
            ],
          },
        ]
      }, [] as Stint[])

      return {
        valid: stints.every((stint) => stint.totalFuel < this.maximumFuel),
        stints,
      }
    },
    estimatedLaps() {
      if (this.raceLengthType === RaceLengthType.Laps) return this.raceLength

      const pitStopEffect = this.pitStopTimeLoss * this.pitStops
      const scheduledRacingTime = this.raceLength * 60 - pitStopEffect
      const lapsForTime = scheduledRacingTime / this.lapTime
      const rounded = Math.ceil(lapsForTime) + 1
      if (this.raceLengthType === RaceLengthType.TimeForLastLap) {
        return rounded + 1
      }
      return rounded
    },

    estimatedTime() {
      return (this as any).estimatedLaps * this.lapTime + this.pitStops * this.pitStopTimeLoss
    },
  },
  methods: {
    round(num: number) {
      return Math.round(num * 100) / 100
    },
    stringify(obj: any) {
      return JSON.stringify(obj, null, 2)
    },
    priorRef(index: number) {
      if (index === 0) return 'as you pit'
      if (index === 1) return 'at the start of the lap'
      return `${index} laps prior`
    },
  },
  updated() {
    localStorage.setItem('racefuel', JSON.stringify(this.$data))
  },
  mounted() {
    const stored = localStorage.getItem('racefuel')
    if (!stored) return
    Object.assign(this, JSON.parse(stored))
  },
  template: `
  <div>
    <block heading="Performance">
      <div class="${css(styles.flex)}">
        <labeledInput label="Fuel per lap">
          <input v-model.number="fuelPerLap" type="number" />
        </labeledInput>
        
        <labeledInput label="Lap time">
          <input v-model.number="lapTime" type="number" />
        </labeledInput>
        
        <labeledInput label="Pit stop time loss">
          <input v-model.number="pitStopTimeLoss" type="number" />
        </labeledInput>
      </div>
    </block>
    
    <block heading="Race duration">
      <div class="${css(styles.radios)}">
        <label class="${css(styles.radioLabel)}">
          <input type="radio" value="${RaceLengthType.Laps}" v-model="raceLengthType"> Laps        
        </label>
        <label class="${css(styles.radioLabel)}">
          <input type="radio" value="${
            RaceLengthType.TimeForEnd
          }" v-model="raceLengthType"> Time, final lap before time limit        
        </label>
        <label class="${css(styles.radioLabel)}">
          <input type="radio" value="${
            RaceLengthType.TimeForLastLap
          }" v-model="raceLengthType"> Time, final lap after time limit        
        </label>
        
        <div v-bind:style="{marginTop: '10px'}">
          {{raceLengthInputLabels[raceLengthType]}} <input v-model.number="raceLength" />
        </div>
      </div>      
      
    </block>
    <block heading="Fuel limits">
      <div class="${css(styles.flex)}">
        <labeledInput label="Minimum fuel load">
          <input v-model.number="minimumFuel" type="number" />
        </labeledInput>
        
        <labeledInput label="Maximum fuel load">
          <input v-model.number="maximumFuel" type="number" />
        </labeledInput>
        
        <labeledInput label="Minimum adjustment">
          <input v-model.number="minimumFuelAdjustment" type="number" />
        </labeledInput>
        
      </div>
    </block>
    
    <block heading="Pit stops">
      <div v-bind:style="{display: 'flex'}">
        <div class="${css(styles.radios)}">
          <label class="${css(styles.radioLabel)}">
            <input type="radio" value='0' v-model.number="pitStops"> None        
          </label>
          <label class="${css(styles.radioLabel)}">
            <input type="radio" value='1' v-model.number="pitStops"> 1        
          </label>
          <label class="${css(styles.radioLabel)}">
            <input type="radio" value="2" v-model.number="pitStops"> 2        
          </label>
        </div>
          
        <div v-bind:style="{marginLeft: '20px', paddingLeft: '20px', borderLeft: '1px solid silver'}">
          <div v-if="pitStops > 0">
            <span class="${css(
              styles.pitStopLabel
            )}">First pit stop at</span> <input v-model.number="pitStopsAt[0]" /> %
          </div>
           <div v-if="pitStops > 1">
            <span class="${css(
              styles.pitStopLabel
            )}">Second pit stop at</span> <input v-model.number="pitStopsAt[1]" /> %
          </div>
        </div>
      </div>           
    </block>
    
    <block heading="Calculated" v-bind:headingColor="this.results.valid ? 'green' : 'orange'">
      <div v-bind:style="{display: 'flex'}">
        <div v-bind:style="{whiteSpace: 'pre-line'}">
          Estimated time: {{round(estimatedTime / 60)}} minutes
          Estimated laps: {{estimatedLaps}}
          Overall fuel consumption {{round(estimatedLaps * fuelPerLap)}}
        </div>
        <div v-for="(stint, index) in results.stints" class="${css(styles.resultPanel)}">
          Stint {{index + 1}}
          <div v-if="stint.stopAtStartOf">Pit at end of lap {{stint.stopAtStartOf}}
            <div v-for="(fuel, index) in stint.fuelChecks" v-bind:style="{fontSize: '0.75em', marginLeft: '15px'}">
              Expect {{round(fuel)}} left {{priorRef(index)}}
            </div>
          </div>
          Add {{round(stint.addFuel)}} fuel for a total of {{round(stint.totalFuel)}}
                
        </div>
      </div>
    </block>
    
  </div>`,
})
