import app from './app.js'

const { css, StyleSheet } = aphrodite

const styles = StyleSheet.create({
  body: {
    margin: 0,
    padding: 0,
  },
})

new Vue({
  el: '#app',
  components: { app },
})

document.body.classList.add(css(styles.body))
