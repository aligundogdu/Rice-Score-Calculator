import { defineComponent, ref, reactive, computed, mergeProps, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderList, ssrRenderStyle } from "vue/server-renderer";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const features = ref([]);
    ref(null);
    const exporting = ref(false);
    const form = reactive({
      id: "",
      name: "",
      description: "",
      reach: 0,
      impact: 1,
      confidencePct: 80,
      effort: 1
    });
    const errors = reactive({
      reach: null,
      impact: null,
      confidencePct: null,
      effort: null
    });
    function score(f) {
      if (f.effort <= 0) return 0;
      return f.reach * f.impact * (f.confidencePct / 100) / f.effort;
    }
    const sorted = computed(() => {
      return [...features.value].sort((a, b) => score(b) - score(a));
    });
    const maxScore = computed(() => {
      return features.value.length ? Math.max(...features.value.map((f) => score(f))) : 0;
    });
    function barWidth(f) {
      const m = maxScore.value;
      if (m <= 0) return "0%";
      const w = score(f) / m * 100;
      return `${w}%`;
    }
    function formatNum(n) {
      return Number.isFinite(n) ? new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(n) : "-";
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><header class="flex items-center justify-between"><h1 class="text-2xl font-bold">RICE Score Calculator</h1><div class="stats shadow"><div class="stat"><div class="stat-title">Total Features</div><div class="stat-value text-primary">${ssrInterpolate(unref(features).length)}</div></div></div></header><section class="card bg-base-200 shadow"><div class="card-body"><h2 class="card-title">Add New Feature</h2><form class="space-y-4"><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label class="label"><span class="label-text">Feature Name</span></label><input${ssrRenderAttr("value", unref(form).name)} type="text" class="input input-bordered w-full" placeholder="e.g. Improve onboarding" required></div><div><label class="label"><span class="label-text">Description</span></label><input${ssrRenderAttr("value", unref(form).description)} type="text" class="input input-bordered w-full" placeholder="Short description"></div></div><div class="grid grid-cols-1 md:grid-cols-5 gap-4 items-end"><div><label class="label"><span class="label-text">Reach</span></label><input${ssrRenderAttr("value", unref(form).reach)} type="number" min="0" step="1" class="input input-bordered w-full" placeholder="e.g. 1000">`);
      if (unref(errors).reach) {
        _push(`<p class="text-error text-sm mt-1">${ssrInterpolate(unref(errors).reach)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div><label class="label"><span class="label-text">Impact (0.25–3)</span></label><input${ssrRenderAttr("value", unref(form).impact)} type="number" min="0.25" max="3" step="0.01" class="input input-bordered w-full" placeholder="e.g. 1.5">`);
      if (unref(errors).impact) {
        _push(`<p class="text-error text-sm mt-1">${ssrInterpolate(unref(errors).impact)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div><label class="label"><span class="label-text">Confidence (%)</span></label><input${ssrRenderAttr("value", unref(form).confidencePct)} type="number" min="0" max="100" step="1" class="input input-bordered w-full" placeholder="e.g. 80">`);
      if (unref(errors).confidencePct) {
        _push(`<p class="text-error text-sm mt-1">${ssrInterpolate(unref(errors).confidencePct)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div><label class="label"><span class="label-text">Effort</span></label><input${ssrRenderAttr("value", unref(form).effort)} type="number" min="0.1" step="0.1" class="input input-bordered w-full" placeholder="e.g. 5">`);
      if (unref(errors).effort) {
        _push(`<p class="text-error text-sm mt-1">${ssrInterpolate(unref(errors).effort)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="flex gap-2"><button type="submit" class="btn btn-primary">Add</button><button type="button" class="btn btn-ghost">Reset</button></div></div></form></div></section>`);
      if (unref(features).length) {
        _push(`<section class="card bg-base-100 shadow"><div class="card-body"><div class="flex items-center justify-between"><h2 class="card-title">Comparison Table</h2><div class="flex gap-2"><button class="btn btn-outline btn-sm">Load Examples</button><button class="btn btn-error btn-sm">Clear All</button><button class="btn btn-primary btn-sm"${ssrIncludeBooleanAttr(!unref(features).length || unref(exporting)) ? " disabled" : ""}>`);
        if (!unref(exporting)) {
          _push(`<span>Export PNG</span>`);
        } else {
          _push(`<span class="loading loading-spinner loading-xs"></span>`);
        }
        _push(`</button></div></div><div class="overflow-x-auto"><table class="table"><thead><tr><th>#</th><th>Feature</th><th>Reach</th><th>Impact</th><th>Confidence</th><th>Effort</th><th>RICE</th><th data-export-exclude></th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(sorted), (f, idx) => {
          _push(`<tr><td>${ssrInterpolate(idx + 1)}</td><td><div><div class="font-medium">${ssrInterpolate(f.name)}</div><div class="text-sm opacity-70">${ssrInterpolate(f.description)}</div></div></td><td>${ssrInterpolate(formatNum(f.reach))}</td><td>${ssrInterpolate(formatNum(f.impact))}</td><td>${ssrInterpolate(Math.round(f.confidencePct))}%</td><td>${ssrInterpolate(formatNum(f.effort))}</td><td class="w-64"><div class="space-y-1"><div class="font-mono">${ssrInterpolate(formatNum(score(f)))}</div><div class="h-2 bg-base-200 rounded"><div class="h-2 bg-primary rounded" style="${ssrRenderStyle({ width: barWidth(f) })}"></div></div></div></td><td class="text-right"><button class="btn btn-ghost btn-sm" data-export-exclude>Delete</button></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div></div></section>`);
      } else {
        _push(`<section class="card bg-base-100 shadow"><div class="card-body"><p class="opacity-70">No features added yet. Fill the form and click “Add”.</p><div><button class="btn btn-outline btn-sm">Load Examples</button></div></div></section>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=index-BsdXWsj0.js.map
