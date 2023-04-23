<!-- Created on 2023/03/24 - 22:14 -->
<template>
    <div class="PromptMenu" ref="menu" v-show="show">
        <button @click="doCopy"><Icon icon="radix-icons:clipboard-copy" /> 复制</button>
        <button @click="doEdit"><Icon icon="radix-icons:pencil-2" /> 编辑</button>
        <button @click="doEditLang"><Icon icon="cil:language" /> 编辑译文</button>
        <button @click="doDelete"><Icon icon="radix-icons:trash" /> 删除</button>
        <label>子类型: 
        <select v-model="subType">
            <option value="quality">质量</option>
            <option value="negative">负面</option>
            <option value="style">风格</option>
            <option value="normal">普通</option>
        </select>
        <label>分类: <input v-model="dir" /></label>
        </label>
        <button @click="doUpdatePrompt"><Icon icon="radix-icons:update" /> {{confirm}}</button>
    </div>
</template>
<style lang="scss">
.PromptMenu {
    position: fixed;
    display: flex;
    flex-direction: column;
    width: 170px;
    background: #000000cf;
    backdrop-filter: blur(20px);
    border-radius: 4px;
    box-shadow: 0 2px 3px #0000004f, 0 8px 8px #00000014;
    max-width: 200px;
    z-index: 100;
    overflow: hidden;

    .button-list {
        border-top: 1px solid #5a5a5a;
        display: flex;
        flex-direction: column;
    }

    button {
        --bk-color: transparent;
        color: #bcbece;
        place-content: flex-start;
        display: flex;
        text-shadow: none;
        place-items: center;
        .iconify {
            margin-right: 10px;
            font-size: 1.2em;
        }
        &:hover {
            --bk-color: #cac2ff26;
            color: #ffffffe8;
        }
        &:active {
            --bk-color: #00000024;
            color: rgba(138, 134, 134, 0.91);
        }
    }
}

.PromptMenu select {
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: #bcbece;
    padding: 4px;
    margin: 4px 0;
    outline: none;
}

.PromptMenu label {
  display: flex;
  flex-direction: column;
  color: #bcbece;
  margin: 4px 0;
}

.PromptMenu input {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: #bcbece;
  padding: 4px;
  margin: 4px 0;
  outline: none;
}

.PromptMenu input:hover {
  border-color: rgba(255, 255, 255, 0.3);
}

.PromptMenu input:focus {
  border-color: #cac2ff26;
  box-shadow: 0 0 3px #cac2ff26;
}

.PromptMenu-ghost {
    position: fixed;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
}
</style>
<script>
import { useClipboard } from "@vueuse/core"
import { useDatabaseServer } from "../../Lib/DatabaseServer/DatabaseServer"
import { EventBus } from "../../../../Global/eventBus"

const subTypeMapping = {
    'quality':'质量/正面',
    'negative':'质量/负面',
    'style':'风格',
    'normal':'普通',
}

let { copy } = useClipboard()
export default {
    mounted() {
        this.$nextTick(() => {})
        document.addEventListener("mousedown", (e) => {
            if (this.show) {
                if (!this.$el.contains(e.target)) this.close()
            }
        })
    },
    data() {
        return {
            show: false,
            bindEl: null,
            clickW: 0,
            promptList: null,
            item: null,
            dir: '默认',
            subType: '',
            confirm: '更新',
        }
    },
    watch:{
        subType :{
            immediate: true,
            handler(val) {
                console.log(this)
                
                
                this.dir = subTypeMapping[this.subType]
                
            },
        }
    },
    methods: {
        doCopy() {
            this.close()
            copy(this.item.data.word.rawText)
        },
        doEdit() {
            this.close()
            this.item.state.isEdit = "text"
            this.bindEl.__vue__.doFoucs()
        },
        doEditLang() {
            this.close()
            this.item.state.isEdit = "lang"
            this.bindEl.__vue__.doFoucs()
        },
        doDelete() {
            this.close()
            this.promptList.removePrompt(this.item)
            this.bindEl.__vue__.$emit("update")
        },
        async doUpdatePrompt() {
            this.close()
            let databaseServer = useDatabaseServer()
            await databaseServer.updatePrompt(this.item.data.word.rawText, {dir:this.dir, lang_zh:this.item.data.word.langText, subType:this.subType})
        },
        async open({ item, el, event, promptList }) {
            // console.log('open')
            this.bindEl = el
            this.clickW = event.clientX
            this.show = true
            this.item = item
            this.promptList = promptList
            let databaseServer = useDatabaseServer()
            let queryResult = await databaseServer.queryPromptsDefine([this.item.data.word.rawText])
            this.confirm = queryResult[0] == null? '添加' : '更新'
            // ** 多于 1 个的话取第一个，后面的不管了
            this.dir = queryResult[0] == null ? subTypeMapping[this.subType]:queryResult[0].dir
            this.updatePosition()
        },
        close() {
            this.show = false
        },
        updatePosition() {
            if (this.bindEl) {
                let elMenu = this.$refs.menu
                if (elMenu) {
                    let menuW = elMenu.getBoundingClientRect().width
                    let rect = this.bindEl.getBoundingClientRect()
                    elMenu.style.left = `${this.clickW - menuW / 2}px`
                    elMenu.style.top = `${rect.y + rect.height}px`
                }
            }
        },
    },
    computed: {},
    beforeDestroy() {},
}
</script>
