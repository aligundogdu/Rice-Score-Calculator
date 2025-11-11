<template>
	<div class="min-h-screen bg-base-100 text-base-content">
		<div class="container mx-auto p-4 md:p-6">
			<NuxtPage />
		</div>
	</div>
	<ThemeToggle />
</template>

<script setup lang="ts">
// basit tema toggle
const isDark = useState('isDark', () => false)
watch(isDark, (v) => {
	if (typeof document !== 'undefined') {
		document.documentElement.setAttribute('data-theme', v ? 'dark' : 'light')
	}
}, { immediate: true })
</script>

<style>
</style>


