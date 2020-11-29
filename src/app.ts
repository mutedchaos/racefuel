import {appHeader} from './appHeader.js'
import calculator from './calculator.js'

export default Vue.component('app', {
  components: {appHeader, calculator},
  template: `
  <div>
    <appHeader />
    <calculator />
  </div>`,
})
