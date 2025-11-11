declare module 'html-to-image' {
	export function toPng(
		node: HTMLElement,
		options?: {
			filter?: (domNode: HTMLElement) => boolean
			quality?: number
			backgroundColor?: string
			width?: number
			height?: number
			canvasWidth?: number
			canvasHeight?: number
			style?: Partial<CSSStyleDeclaration>
			pixelRatio?: number
			cacheBust?: boolean
			includeQueryParams?: boolean
			skipFonts?: boolean
		}
	): Promise<string>

	export function toJpeg(
		node: HTMLElement,
		options?: Parameters<typeof toPng>[1]
	): Promise<string>

	export function toSvg(
		node: HTMLElement,
		options?: Parameters<typeof toPng>[1]
	): Promise<string>
}

