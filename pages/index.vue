<template>
	<div class="space-y-6">
		<header class="flex items-center justify-between">
			<h1 class="text-2xl font-bold">RICE Score Calculator</h1>
			<div class="stats shadow">
				<div class="stat">
					<div class="stat-title">Total Features</div>
					<div class="stat-value text-primary">{{ features.length }}</div>
				</div>
			</div>
		</header>

		<section class="card bg-base-200 shadow">
			<div class="card-body">
				<h2 class="card-title">Add New Feature</h2>
				<form class="space-y-4" @submit.prevent="addFeature">
					<!-- Row 1: name + description -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label class="label"><span class="label-text">Feature Name</span></label>
							<input v-model.trim="form.name" type="text" class="input input-bordered w-full" placeholder="e.g. Improve onboarding" required />
						</div>
						<div>
							<label class="label"><span class="label-text">Description</span></label>
							<input v-model.trim="form.description" type="text" class="input input-bordered w-full" placeholder="Short description" />
						</div>
					</div>
					<!-- Row 2: metrics -->
					<div class="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
						<div>
							<label class="label"><span class="label-text">Reach</span></label>
							<input v-model.number="form.reach" type="number" min="0" step="1" class="input input-bordered w-full" placeholder="e.g. 1000" />
							<p v-if="errors.reach" class="text-error text-sm mt-1">{{ errors.reach }}</p>
						</div>
						<div>
							<label class="label"><span class="label-text">Impact (0.25–3)</span></label>
							<input v-model.number="form.impact" type="number" min="0.25" max="3" step="0.01" class="input input-bordered w-full" placeholder="e.g. 1.5" />
							<p v-if="errors.impact" class="text-error text-sm mt-1">{{ errors.impact }}</p>
						</div>
						<div>
							<label class="label"><span class="label-text">Confidence (%)</span></label>
							<input v-model.number="form.confidencePct" type="number" min="0" max="100" step="1" class="input input-bordered w-full" placeholder="e.g. 80" />
							<p v-if="errors.confidencePct" class="text-error text-sm mt-1">{{ errors.confidencePct }}</p>
						</div>
						<div>
							<label class="label"><span class="label-text">Effort</span></label>
							<input v-model.number="form.effort" type="number" min="0.1" step="0.1" class="input input-bordered w-full" placeholder="e.g. 5" />
							<p v-if="errors.effort" class="text-error text-sm mt-1">{{ errors.effort }}</p>
						</div>
						<div class="flex gap-2">
							<button type="submit" class="btn btn-primary">Add</button>
							<button type="button" class="btn btn-ghost" @click="resetForm">Reset</button>
						</div>
					</div>
				</form>
			</div>
		</section>

		<section v-if="features.length" class="card bg-base-100 shadow">
			<div class="card-body">
				<div class="flex items-center justify-between">
					<h2 class="card-title">Comparison Table</h2>
					<div class="flex gap-2">
						<button class="btn btn-outline btn-sm" @click="seedExamples">Load Examples</button>
						<button class="btn btn-error btn-sm" @click="clearAll">Clear All</button>
						<button class="btn btn-primary btn-sm" :disabled="!features.length || exporting" @click="exportPng">
							<span v-if="!exporting">Export PNG</span>
							<span v-else class="loading loading-spinner loading-xs"></span>
						</button>
					</div>
				</div>
				<div class="overflow-x-auto" ref="tableRef">
					<table class="table">
						<thead>
							<tr>
								<th>#</th>
								<th>Feature</th>
								<th>Reach</th>
								<th>Impact</th>
								<th>Confidence</th>
								<th>Effort</th>
								<th>RICE</th>
								<th data-export-exclude></th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(f, idx) in sorted" :key="f.id">
								<td>{{ idx + 1 }}</td>
								<td>
									<div>
										<div class="font-medium">{{ f.name }}</div>
										<div class="text-sm opacity-70">{{ f.description }}</div>
									</div>
								</td>
								<td>{{ formatNum(f.reach) }}</td>
								<td>{{ formatNum(f.impact) }}</td>
								<td>{{ Math.round(f.confidencePct) }}%</td>
								<td>{{ formatNum(f.effort) }}</td>
								<td class="w-64">
									<div class="space-y-1">
										<div class="font-mono">{{ formatNum(score(f)) }}</div>
										<div class="h-2 bg-base-200 rounded">
											<div class="h-2 bg-primary rounded" :style="{ width: barWidth(f) }"></div>
										</div>
									</div>
								</td>
								<td class="text-right">
									<button class="btn btn-ghost btn-sm" @click="removeFeature(f.id)" data-export-exclude>Delete</button>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</section>

		<section v-else class="card bg-base-100 shadow">
			<div class="card-body">
				<p class="opacity-70">No features added yet. Fill the form and click “Add”.</p>
				<div>
					<button class="btn btn-outline btn-sm" @click="seedExamples">Load Examples</button>
				</div>
			</div>
		</section>
	</div>
	</template>

<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'

interface Feature {
	id: string
	name: string
	description: string
	reach: number
	impact: number
	confidencePct: number
	effort: number
}

const features = ref<Feature[]>([])
const tableRef = ref<HTMLElement | null>(null)
const exporting = ref(false)

const form = reactive<Feature>({
	id: '',
	name: '',
	description: '',
	reach: 0,
	impact: 1,
	confidencePct: 80,
	effort: 1
})

const errors = reactive<Record<string, string | null>>({
	reach: null,
	impact: null,
	confidencePct: null,
	effort: null
})

function validate(): boolean {
	errors.reach = form.reach < 0 ? 'Reach cannot be negative' : null
	// Impact typical range: 0.25–3
	if (form.impact < 0.25) {
		errors.impact = 'Impact must be at least 0.25'
	} else if (form.impact > 3) {
		errors.impact = 'Impact must be at most 3'
	} else {
		errors.impact = null
	}
	errors.confidencePct =
		form.confidencePct < 0 || form.confidencePct > 100 ? 'Confidence must be between 0 and 100' : null
	errors.effort = form.effort <= 0 ? 'Effort must be greater than 0' : null
	return !errors.reach && !errors.impact && !errors.confidencePct && !errors.effort
}

function addFeature() {
	if (!validate()) return
	const f: Feature = {
		...form,
		id: uuidv4().slice(0, 8)
	}
	features.value.push(f)
	resetForm()
}

function resetForm() {
	form.id = ''
	form.name = ''
	form.description = ''
	form.reach = 0
	form.impact = 1
	form.confidencePct = 80
	form.effort = 1
	for (const k of Object.keys(errors)) {
		errors[k] = null
	}
}

function removeFeature(id: string) {
	features.value = features.value.filter((f) => f.id !== id)
}

function clearAll() {
	features.value = []
}

function score(f: Feature): number {
	if (f.effort <= 0) return 0
	return (f.reach * f.impact * (f.confidencePct / 100)) / f.effort
}

const sorted = computed(() => {
	return [...features.value].sort((a, b) => score(b) - score(a))
})

const maxScore = computed(() => {
	return features.value.length ? Math.max(...features.value.map((f) => score(f))) : 0
})

function barWidth(f: Feature): string {
	const m = maxScore.value
	if (m <= 0) return '0%'
	const w = (score(f) / m) * 100
	return `${w}%`
}

function formatNum(n: number): string {
	return Number.isFinite(n) ? new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(n) : '-'
}

async function exportPng() {
	if (!tableRef.value) return
	try {
		exporting.value = true
		const node = tableRef.value as HTMLElement
		const { toPng } = await import('html-to-image')
		// Geçici olarak temayı light yap, beyaz arka planla export al
		const root = document.documentElement
		const prevTheme = root.getAttribute('data-theme')
		root.setAttribute('data-theme', 'light')
		// high-DPI çıktısı için pixelRatio artır
		const dataUrl = await toPng(node, {
			cacheBust: true,
			pixelRatio: 2,
			backgroundColor: '#ffffff',
			filter: (domNode) => {
				// Element olmayan nodelar (Text, Comment) için izin ver
				if (!(domNode instanceof Element)) return true
				// Kendisi veya atalarında export'tan hariç işareti olanları dışla
				return !(
					domNode.hasAttribute('data-export-exclude') ||
					domNode.closest('[data-export-exclude]')
				)
			}
		})
		// temayı eski haline getir
		if (prevTheme) {
			root.setAttribute('data-theme', prevTheme)
		} else {
			root.removeAttribute('data-theme')
		}
		const link = document.createElement('a')
		link.download = `rice-results-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.png`
		link.href = dataUrl
		link.click()
	} catch (e) {
		console.error(e)
	} finally {
		exporting.value = false
	}
}

function seedExamples() {
	if (features.value.length) return
	const samples: Feature[] = [
		{ id: uuidv4().slice(0, 8), name: 'New onboarding', description: 'Increase conversions', reach: 5000, impact: 1.5, confidencePct: 80, effort: 5 },
		{ id: uuidv4().slice(0, 8), name: 'Error tracking', description: 'Improve stability', reach: 2000, impact: 1.2, confidencePct: 70, effort: 3 },
		{ id: uuidv4().slice(0, 8), name: 'Search improvements', description: 'Faster results', reach: 8000, impact: 2.0, confidencePct: 90, effort: 10 }
	]
	features.value = samples
}
</script>

<style scoped>
</style>


