<template>
	<div class="fixed bottom-4 right-4">
		<label class="swap swap-rotate btn btn-circle btn-ghost">
			<input type="checkbox" v-model="isDark" />
			<svg class="swap-off fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
				<path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41h0a1,1,0,0,0,1.41,0L7,18.36A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7,4.93,6.29A1,1,0,0,0,3.52,7.7L4.23,8.41A1,1,0,0,0,5.64,7ZM12,19a7,7,0,1,1,7-7A7,7,0,0,1,12,19Zm6.36-2,.71.71a1,1,0,1,0,1.41-1.41L19.77,15.6A1,1,0,1,0,18.36,17ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2ZM17,5.64l.71-.71a1,1,0,0,0-1.41-1.41L15.6,4.23A1,1,0,1,0,17,5.64Z" />
			</svg>
			<svg class="swap-on fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
				<path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Z" />
			</svg>
		</label>
	</div>
	</template>

<script setup lang="ts">
const isDark = useState('isDark', () => false)
</script>


