import { effect } from "../signals";
// import * as v from "valibot";

interface EventListener<Event> {
    (event: Event): Promise<void> | void;
}

export abstract class ReactiveElement extends HTMLElement {
    protected disconnect = new AbortController();

    protected hydrateListener<Type extends keyof HTMLElementEventMap>(
        target: EventTarget,
        type: Type,
        listener: EventListener<HTMLElementEventMap[Type]>,
    ) {
        target.addEventListener(type, listener as any, { signal: this.disconnect.signal });
    }

    protected renderEffect(callback: () => void) {
        effect(callback, { signal: this.disconnect.signal });
    }

    public disconnectedCallback() {
        this.disconnect.abort();
    }

    // protected readonly attrSchema!: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;

    // protected get attrs(): v.InferOutput<typeof this.attrSchema> | undefined {
    //     if (!this.attrSchema) return undefined;
    //     return v.parse(this.attrSchema, this.dataset);
    // }

    // override readonly attrSchema = v.object({
    //     postId: v.number(),
    //     likeCount: v.number(),
    //     isLiked: v.boolean(),
    // });

    // protected get attrs(): v.InferOutput<typeof this.attrSchema> | undefined {
    //     if (!this.attrSchema) return undefined;
    //     return v.parse(this.attrSchema, this.dataset);
    // }

    protected static readonly tagName: string;

    static register(tagName = this.tagName) {
        customElements.define(tagName, this as any);
    }
}