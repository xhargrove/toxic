"use client";

import { useActionState } from "react";

import { createPostAction, type CreatePostState } from "@/lib/posts/actions";
import { Button } from "@/components/ui/button";

const inputClass =
  "placeholder:text-muted-foreground flex min-h-9 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm";

export function CreatePostForm() {
  const [state, action, pending] = useActionState(createPostAction, null as CreatePostState);

  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <input id="title" name="title" required minLength={5} maxLength={180} className={inputClass} />
        {state?.fieldErrors?.title?.[0] ? (
          <p className="text-destructive text-xs">{state.fieldErrors.title[0]}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="citySlug" className="text-sm font-medium">
          City slug
        </label>
        <input
          id="citySlug"
          name="citySlug"
          required
          placeholder="e.g. austin-tx"
          className={inputClass}
        />
        {state?.fieldErrors?.citySlug?.[0] ? (
          <p className="text-destructive text-xs">{state.fieldErrors.citySlug[0]}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="body" className="text-sm font-medium">
          Body
        </label>
        <textarea
          id="body"
          name="body"
          required
          minLength={20}
          rows={8}
          className={`${inputClass} min-h-[180px]`}
        />
        {state?.fieldErrors?.body?.[0] ? (
          <p className="text-destructive text-xs">{state.fieldErrors.body[0]}</p>
        ) : null}
      </div>

      {state?.error ? (
        <p className="text-destructive text-sm" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Publishing…" : "Publish"}
      </Button>
    </form>
  );
}
