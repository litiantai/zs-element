<template>
  <div :class="{ max: visible }">
    <div class="fold">
      <el-icon
        style="margin-right: 8px"
        @click="visible = !visible"
        id="foldButton"
        :size="17"
      >
        <FullScreen />
      </el-icon>
    </div>
    <div
      :id="`map-${props.questionId}`"
      :style="{
        width: visible ? '100%' : props.width + '!important',
        height: visible ? '95%' : props.height + '!important',
      }"
    ></div>
  </div>
  <div id="menu-container">
    <div v-show="menuVisible && props.editable">
      <el-card title="节点信息" class="menu" :style="menuStyle">
        <template #header>
          <div class="card-header">
            <span>节点信息</span>
          </div>
        </template>
        <div class="card-container">
          <el-radio-group
            v-if="tags.length > 0"
            v-model="currentTag"
            @change="handleTagChange"
            size="small"
          >
            <el-radio
              v-for="(item, index) in tags"
              :key="index"
              :value="item.name"
              :disabled="item.disabled"
            >
              {{ item.name }}
            </el-radio>
          </el-radio-group>
          <el-input
            type="textarea"
            v-model="currentRemark"
            @change="handleRemarkChange"
            placeholder="请输入备注（当选中多个节点时，会同时修改对每个节点的备注）"
            :readonly="!props.editable"
            :rows="4"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  reactive,
  ref,
  type Ref,
  type WritableComputedRef,
} from "vue";
import MindElixir from "mind-elixir";
import { debounce, isEmpty } from "lodash-es";
import { FullScreen } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
const props = defineProps({
  questionId: {
    type: Number,
    default: +Date.now(),
  },
  value: {
    type: String,
    default: "",
  },
  tag: {
    type: String,
    default: "",
  },
  width: {
    type: String,
    default: "700px",
  },
  height: {
    type: String,
    default: "300px",
  },
  editable: {
    type: Boolean,
    default: true,
  },
});

const emits = defineEmits(["update:value"]);

const visible = ref(false);

const data: WritableComputedRef<any> = computed({
  get: () => {
    return props.value === ""
      ? MindElixir.new("新主题")
      : JSON.parse(props.value);
  },
  set: (val: string) => {
    emits("update:value", val);
  },
});
const tags: Ref<any> = ref([]);

const refresh = () => {
  nextTick(() => {
    mind.refresh(data.value);
  });
};

let mind: any;
const clipboardObj = navigator.clipboard;

// 标签选择器
const menuStyle = reactive({
  left: "",
  top: "",
});
const menuVisible = ref(false);
const currentTag = ref("");
const currentRemark = ref("");
const handleTagChange = (val: any) => {
  if (mind.currentNode) {
    mind.reshapeNode(MindElixir.E(mind.currentNode.nodeObj.id), {
      tags: [val],
    });
  }
  if (mind.currentNodes && !isEmpty(mind.currentNodes)) {
    mind.currentNodes.forEach((node: any) => {
      mind.reshapeNode(MindElixir.E(node.nodeObj.id), { tags: [val] });
    });
  }
};
const handleRemarkChange = (val: any) => {
  if (mind.currentNode) {
    mind.reshapeNode(MindElixir.E(mind.currentNode.nodeObj.id), {
      hyperLink: val,
    });
  }
  if (mind.currentNodes && !isEmpty(mind.currentNodes)) {
    mind.currentNodes.forEach((node: any) => {
      mind.reshapeNode(MindElixir.E(node.nodeObj.id), { hyperLink: val });
    });
  }
};

let currentTarget: any = {};

onMounted(async () => {
  mind = new MindElixir({
    el: `#map-${props.questionId}`,
    // theme,
    editable: props.editable,
  });

  await mind.init(data.value);
  // 添加快捷标签栏插件
  mind.container.appendChild(
    document.getElementById("menu-container")?.childNodes[0]
  );

  const mindEl = document.getElementById(`map-${props.questionId}`);
  if (mindEl) {
    mindEl.addEventListener("mouseup", (e: any) => {
      currentTarget = e;
    });
  }
  nextTick(() => {
    // 把foldButton 插入到mind的容器中
    var button = mind.container.querySelector("#fullscreen");
    // var button = document.getElementById("#fullscreen")!;
    var parantButton = button.parentNode;
    var fold: any = document.querySelector("#foldButton");
    parantButton!.insertBefore(fold, button);
    if (mindEl) {
      mindEl.style.width = props.width;
      mindEl.style.height = props.height;
      mind.toCenter();
    }
  });

  // 添加订阅事件
  mind.bus.addListener(
    "operation",
    debounce(() => {
      data.value = mind.getDataString();
    }, 1000)
  );
  mind.bus.addListener("selectNode", (node: any, e: any) => {
    // 显示快捷标签栏
    tags.value = [];
    if (!isEmpty(props.tag) && props.tag.indexOf("学校") >= 0) {
      if (!node.parent) {
        tags.value = props.tag.split(",").map((tag: any) => {
          if (tag === "学校") return { name: tag, disabled: false };
          else return { name: tag, disabled: true };
        });
      } else {
        if (!node.parent.tags) {
          ElMessage.warning("请先设置父节点标签~");
        } else {
          const parentTag = node.parent.tags[0];
          if (["学校"].includes(parentTag)) {
            tags.value = props.tag.split(",").map((tag: any) => {
              if (
                [
                  "校区",
                  "学部",
                  "高考招生大类",
                  "特色班型/拔尖计划等",
                  "学院",
                  "专业",
                  "双学位",
                ].includes(tag)
              )
                return {
                  name: tag,
                  disabled: false,
                };
              else return { name: tag, disabled: true };
            });
          } else if (
            [
              "校区",
              "学部",
              "高考招生大类",
              "特色班型/拔尖计划等",
              "双学位",
            ].includes(parentTag)
          ) {
            tags.value = props.tag.split(",").map((tag: any) => {
              if (["学院", "专业"].includes(tag))
                return { name: tag, disabled: false };
              else return { name: tag, disabled: true };
            });
          } else if (["学院"].includes(parentTag)) {
            tags.value = props.tag.split(",").map((tag: any) => {
              if (["学院下的大类专业", "专业"].includes(tag))
                return { name: tag, disabled: false };
              else return { name: tag, disabled: true };
            });
          } else if (["学院下的大类专业"].includes(parentTag)) {
            tags.value = props.tag.split(",").map((tag: any) => {
              if (["专业"].includes(tag)) return { name: tag, disabled: false };
              else return { name: tag, disabled: true };
            });
          }
        }
      }
    } else {
      tags.value = isEmpty(props.tag)
        ? []
        : props.tag.split(",").map((tag: any) => {
            return { name: tag, disabled: false };
          });
    }
    // 定位展示节点信息卡片
    if (e) {
      const { left, top, height } = e.target.getBoundingClientRect();
      menuStyle.left = `${left}px`;
      menuStyle.top = `${top + height + 5}px`;
      currentTag.value = node.tags ? node.tags[0] : "";
      currentRemark.value = node.hyperLink ? node.hyperLink : "";
      menuVisible.value = true;
    }
  });
  mind.bus.addListener("selectNodes", (nodes: any) => {
    tags.value = [];
    if (!isEmpty(props.tag) && props.tag.indexOf("学校") >= 0) {
      tags.value = isEmpty(props.tag)
        ? []
        : props.tag.split(",").map((tag: any) => {
            return { name: tag, disabled: false };
          });
      // 展示选项
      const { clientX, clientY } = currentTarget;
      menuStyle.left = `${clientX}px`;
      menuStyle.top = `${clientY - 25}px`;
      currentTag.value = "";
      menuVisible.value = true;
    }
  });
  mind.bus.addListener("unselectNode", () => {
    menuVisible.value = false;
  });
  mind.bus.addListener("unselectNodes", () => {
    menuVisible.value = false;
  });
  // 重写复制粘贴事件，从剪切板读取数据
  mind.map.addEventListener("keydown", (e: any) => {
    // 抽取复制节点方法
    const copy = () => {
      if (mind.waitCopy) {
        const list = mind.waitCopy.map((item: any) => {
          return {
            id: item.nodeObj.id,
            parentId: item.nodeObj.parent.id,
            name: `${item.nodeObj.topic}QAQ${
              !isEmpty(item.nodeObj.tags) ? item.nodeObj.tags[0] : ""
            }QAQ${
              !isEmpty(item.nodeObj.hyperLink) ? item.nodeObj.hyperLink : ""
            }`,
          };
        });
        const tree = flatArrayToTree(list);
        const treeStr = structural(tree);
        writeClipboard(treeStr);
      }
    };
    if ((e.metaKey || e.ctrlKey) && e.key === "c") {
      copy();
      if (mind.waitCopy) mind.waitCopy = null;
    } else if ((e.metaKey || e.ctrlKey) && e.key === "x") {
      copy();
      if (mind.waitCopy) {
        mind.removeNode(mind.waitCopy);
        mind.waitCopy = null;
      }
    } else if ((e.metaKey || e.ctrlKey) && e.key === "v") {
      getCurrentClipboard().then((text: any) => {
        if (text) {
          const list = unStructural(text);
          const parentId = mind.currentNode.nodeObj.id;
          list.forEach((item: any) => {
            let name = "",
              tags: any = [],
              remark: any = "";
            if (item.name.indexOf("QAQ") > -1) {
              name = item.name.split("QAQ")[0];
              tags =
                item.name.split("QAQ")[1] === ""
                  ? []
                  : [item.name.split("QAQ")[1]];
              remark = item.name.split("QAQ")[2];
            } else {
              name = item.name;
              tags = [];
              remark = "";
            }
            if (!item.parentId) {
              mind.addChild(MindElixir.E(parentId), {
                topic: name,
                id: item.id,
                tags,
                hyperLink: remark,
              });
            } else {
              mind.addChild(MindElixir.E(item.parentId), {
                topic: name,
                id: item.id,
                tags,
                hyperLink: remark,
              });
            }
          });
        }
      });
    }
  });
});

const writeClipboard = (val: any) => {
  clipboardObj
    .writeText(val)
    .then(() => {
      ElMessage.success("复制成功");
    })
    .catch((err: any) => {
      console.log(err);
    });
};

const getCurrentClipboard = () => {
  return new Promise((resolve, reject) => {
    clipboardObj.readText().then((text: any) => {
      resolve(text);
    });
  }).catch((err: any) => {
    console.log(err);
  });
};

const flatArrayToTree = (flatData: any) => {
  const result: any = [];
  const map: any = {};

  // 先构建一个id映射表
  flatData.forEach((item: any) => {
    map[item.id] = { ...item, children: [] };
  });
  const keys = Object.keys(map);

  // 然后根据parentId将子节点添加到父节点的children属性下
  flatData.forEach((item: any) => {
    if (item.parentId !== null && keys.includes(item.parentId)) {
      map[item.parentId].children.push(map[item.id]);
    } else {
      result.push(map[item.id]);
    }
  });

  return result;
};

const structural = (tree: any) => {
  const result: string[] = [];

  const traverse = (item: any, level: number = 0) => {
    result.push(`${" ".repeat(level)}${item.name}`);
    if (item.children) {
      item.children.forEach((child: any) => {
        traverse(child, level + 1);
      });
    }
  };
  tree.forEach((item: any) => {
    traverse(item);
  });

  return result.join("\n");
};

const unStructural = (val: string) => {
  const list = val.split("\n");
  const result: any = [];

  list.forEach((item: string) => {
    const level = countSpace(item);
    const name = item.trim();
    const parentItem = result.findLast((item: any) => {
      return item.level === level - 1;
    });
    const parentId = parentItem ? parentItem.id : null;
    result.push({
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      name,
      parentId,
      level,
    });
  });

  return result;
};

const countSpace = (val: string) => {
  const reg = val.match(/^\s+/);
  if (!reg) return 0;
  else return reg[0].length;
};

// 检查院校结构情况下是否有节点没有打标签
const validate = () => {
  let flag = true;

  // 递归检查方法
  const checkTag = (node: any) => {
    if (isEmpty(node.tags)) {
      flag = false;
      return;
    }
    if (!isEmpty(node.children)) {
      node.children.map((node: any) => checkTag(node));
    }
  };

  if (!isEmpty(props.tag) && props.tag.indexOf("学校") >= 0) {
    checkTag(data.value.nodeData);
  }

  return flag;
};

// 暴露方法
defineExpose({
  validate,
  refresh,
});
</script>

<style scoped lang="less">
.max {
  width: 100vw !important;
  height: 100vh !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  background-color: #f0f0f0 !important;
  z-index: 9998 !important;
}

.menu {
  position: fixed;
  width: 400px;

  .card-container {
    display: flex;
    flex-direction: column;
    row-gap: 20px;
  }
}
</style>

<style>
.mind-elixir-toolbar.rb {
  display: flex;
  align-items: center;
}
.map-container {
  border-radius: 4px;
}
</style>
