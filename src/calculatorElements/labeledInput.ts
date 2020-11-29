const { StyleSheet, css } = aphrodite

const styles = StyleSheet.create({
  container: {},
  label: {},
})

export default Vue.component('block', {
  props: ['label'],
  template: `<div class='${css(styles.container)}'>
    <div class="${css(styles.label)}">{{label}}</div>    
    <slot/></div>`,
})
