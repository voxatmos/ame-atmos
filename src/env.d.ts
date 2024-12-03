/// <reference types="vite/client" />

declare const __brand: unique symbol

interface Brand<T> {
	readonly [__brand]: T
}

type Branded<T, U> = T & Brand<U>;

interface Body {

	json<T>(): Promise<T>

}
