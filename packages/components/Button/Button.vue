<script setup lang="ts">
import { ref, computed, inject } from "vue";
import type { ButtonProps, ButtonEmits, ButtonInstance } from "./types";
import { throttle } from "lodash-es";
import ZsIcon from "../Icon/Icon.vue";
import { ElButton } from "element-plus";
import { BUTTON_GROUP_CTX_KEY } from "./constants";
/**
 * Button.vue
 * Button.test.tsx
 * types.ts
 * style.css
 * constants.ts
 */

const emits = defineEmits<ButtonEmits>();

defineOptions({
  name: "ZsButton",
});

const props = withDefaults(defineProps<ButtonProps>(), {
  tag: "button",
  nativeType: "button",
  useThrottle: true,
  throttleDuration: 500,
});

const slots = defineSlots();
const buttonGroupCtx = inject(BUTTON_GROUP_CTX_KEY, void 0);

const _ref = ref<HTMLButtonElement>();
const size = computed(() => buttonGroupCtx?.size ?? props.size ?? "");
const type = computed(() => buttonGroupCtx?.type ?? props.type ?? "");

const disabled = computed(
  () => props.disabled || buttonGroupCtx?.disabled || false
);
const iconStyle = computed(() => ({
  marginRight: slots.default ? "6px" : "0px",
}));
const handleBtnClick = (e: MouseEvent) => emits("click", e);
const handleBtnClickThrottle = throttle(
  handleBtnClick,
  props.throttleDuration,
  {
    trailing: false,
  }
);

defineExpose<ButtonInstance>({
  ref: _ref,
});
</script>

<template>
  <!-- <component
    :is="props.tag"
    ref="_ref"
    :type="tag === 'button' ? nativeType : void 0"
    :disabled="disabled || loading ? true : void 0"
    :autofocus="autofocus"
    :class="{
      [`zs-button--${type}`]: type,
      [`zs-button--${size}`]: size,
      'is-plain': plain,
      'is-round': round,
      'is-circle': circle,
      'is-disabled': disabled,
      'is-loading': loading,
    }"
    @click="(e: MouseEvent) => useThrottle ? handleBtnClickThrottle(e) : handleBtnClick(e)"
  >
    <template v-if="loading">
      <slot name="loading">
        <zs-icon
          class="loading-icon"
          :icon="loadingIcon ?? 'spinner'"
          style="iconStyle"
          size="1x"
          spin
        />
      </slot>
    </template>
    <zs-icon
      v-if="icon || !loading"
      :icon="icon"
      size="1x"
      :style="iconStyle"
    ></zs-icon>
    <slot></slot>
  </component> -->
  <el-button type="primary"><slot></slot></el-button>
</template>

<style>
/* @import "./style.css"; */
</style>
