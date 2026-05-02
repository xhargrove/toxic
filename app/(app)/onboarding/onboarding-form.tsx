"use client";

import { useActionState } from "react";

import {
  completeOnboardingAction,
  type CompleteOnboardingState,
} from "@/lib/users/update-profile";
import { Button } from "@/components/ui/button";

const inputClass =
  "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20";

type CityOption = { id: string; name: string; slug: string; state: string };

export function OnboardingForm({
  defaultUsername,
  defaultDisplayName,
  defaultAvatarUrl,
  defaultHomeCityId,
  cities,
}: {
  defaultUsername: string;
  defaultDisplayName: string;
  defaultAvatarUrl: string;
  defaultHomeCityId: string;
  cities: CityOption[];
}) {
  const [state, action, pending] = useActionState(completeOnboardingAction, null as CompleteOnboardingState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="username" className="text-sm font-medium">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          defaultValue={defaultUsername}
          className={inputClass}
          aria-invalid={Boolean(state?.fieldErrors?.username)}
        />
        <p className="text-muted-foreground text-xs">3–24 characters: letters, numbers, underscores.</p>
        {state?.fieldErrors?.username?.[0] ? (
          <p className="text-destructive text-xs">{state.fieldErrors.username[0]}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="displayName" className="text-sm font-medium">
          Display name
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          autoComplete="name"
          required
          defaultValue={defaultDisplayName}
          maxLength={80}
          className={inputClass}
          aria-invalid={Boolean(state?.fieldErrors?.displayName)}
        />
        {state?.fieldErrors?.displayName?.[0] ? (
          <p className="text-destructive text-xs">{state.fieldErrors.displayName[0]}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="avatarUrl" className="text-sm font-medium">
          Avatar URL <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <input
          id="avatarUrl"
          name="avatarUrl"
          type="url"
          inputMode="url"
          placeholder="https://…"
          defaultValue={defaultAvatarUrl}
          className={inputClass}
          aria-invalid={Boolean(state?.fieldErrors?.avatarUrl)}
        />
        {state?.fieldErrors?.avatarUrl?.[0] ? (
          <p className="text-destructive text-xs">{state.fieldErrors.avatarUrl[0]}</p>
        ) : null}
      </div>

      {cities.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="homeCityId" className="text-sm font-medium">
            Home city <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <select
            id="homeCityId"
            name="homeCityId"
            defaultValue={defaultHomeCityId}
            className={inputClass}
            aria-invalid={Boolean(state?.fieldErrors?.homeCityId)}
          >
            <option value="">No city selected</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}, {c.state} ({c.slug})
              </option>
            ))}
          </select>
          {state?.fieldErrors?.homeCityId?.[0] ? (
            <p className="text-destructive text-xs">{state.fieldErrors.homeCityId[0]}</p>
          ) : null}
        </div>
      ) : null}

      {state?.error ? (
        <p className="text-destructive text-sm" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Saving…" : "Continue"}
      </Button>
    </form>
  );
}
