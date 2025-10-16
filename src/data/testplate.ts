import { Template } from "../Template";

const testplateBackground = new URL('/assets/testplate.png', import.meta.url).href;

export const testplate: Template = {
    background: testplateBackground,
}
