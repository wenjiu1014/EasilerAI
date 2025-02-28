const { ipcRenderer } = require("electron");
const Vue = require('vue')
const { defaultConfig, getConfig, applyConfig } = require("../../utils/store")

applyConfig()
let biasX = 0
let biasY = 0
const moveS = [0, 0, 0, 0]
function calcS() {
  const res = Math.pow(moveS[0] - moveS[2], 2) + Math.pow(moveS[1] - moveS[3], 2)
  return res < 5
}
function handleMove(e) {
  ipcRenderer.send('ballWindowMove', { x: e.screenX - biasX, y: e.screenY - biasY })
}


document.addEventListener('DOMContentLoaded', () => {
  const imgElement = document.querySelector('.rotate');

  ipcRenderer.on('toggle-rotate', (event, rotateFlag) => {
    if (rotateFlag) {
      imgElement.classList.add('rotate');
    } else {
      imgElement.classList.remove('rotate');
    }
  });
});

const app = Vue.createApp({

  data: () => {
    return {
      isNotMore: true,
      opacity: 0.8,
      mainColor: '',
      subColor: ''
    }
  },

  mounted() {
    const storage = getConfig()
    this.mainColor = storage.mainColor
    this.subColor = storage.subColor
    this.opacity = storage.opacity
    // ipcRenderer.on("update", (e, data) => {
    //   console.log(data)
    //   this.count = data
    // })
    // ipcRenderer.on("config", (e, data) => {
    //   this.opacity = data.opacity
    //   this.mainColor = data.mainColor
    //   this.subColor = data.subColor
    // })
    // ipcRenderer.send("updateBall")
  },
  methods: {
    showMore() {
      this.isNotMore = false
      // ipcRenderer.send('setFloatIgnoreMouse', false)
    },
    showWebsite() {
      if (calcS())
        ipcRenderer.send("showWebsite", "show")
    },
    hideMore() {
      this.isNotMore = true
      // ipcRenderer.send('setFloatIgnoreMouse', true)
    },
    handleMouseDown(e) {
      if (e.button == 2) {
        this.isNotMore = true
        ipcRenderer.send('openMenu')
        return
      }
      biasX = e.x;
      biasY = e.y;
      moveS[0] = e.screenX - biasX
      moveS[1] = e.screenY - biasY
      document.addEventListener('mousemove', handleMove)
    },
    handleMouseUp(e) {
      moveS[2] = e.screenX - e.x
      moveS[3] = e.screenY - e.y
      biasX = 0
      biasY = 0
      document.removeEventListener('mousemove', handleMove)
    },
  },
  // computed: {
  //   progress: function () {
  //     const totalCount = this.count[0] + this.count[1]
  //     console.log("aaa" + totalCount)
  //     if (totalCount == 0) {
  //       return "0%"
  //     } else {
  //       const percent = parseInt(this.count[1] * 100 / totalCount)
  //       return percent + "%"
  //     }
  //   }
  // }
})
app.mount("#app")