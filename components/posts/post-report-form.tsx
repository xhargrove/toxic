"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { reportPostAction, type ReportPostState } from "@/lib/reports/actions";
import { Button } from "@/components/ui/button";

function SubmitLabel({ idle }: { idle: string }) {
  const { pending } = useFormStatus();
  return pending ? "Sending…" : idle;
}

const inputClass =
  "placeholder:text-muted-foreground flex h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm disabled:pointer-events-none disabled:opacity-50";

const textareaClass =
  "placeholder:text-muted-foreground flex min-h-[72px] w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm disabled:pointer-events-none disabled:opacity-50";

const REASON_PRESETS = [
  "Spam or misleading content",
  "Harassment or abuse",
  "Illegal or harmful content",
  "Other",
] as const;

export function PostReportForm({ postId }: { postId: string }) {
  const [state, action] = useActionState(reportPostAction, null as ReportPostState);

  return (
    <section id="report" className="border-border mt-10 scroll-mt-24 rounded-lg border p-4">
      <h2 className="text-lg font-semibold tracking-tight">Report this post</h2>
      <p className="text-muted-foreground mt-1 text-xs">
        Reports create a moderation ticket. Multiple open reports may move the post to review.
      </p>

      {state?.ok ? (
        <p className="text-muted-foreground mt-4 text-sm" role="status">
          Thanks — your report was submitted.
        </p>
      ) : (
        <form action={action} className="mt-4 flex flex-col gap-3">
          <input type="hidden" name="postId" value={postId} />
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`report-reason-${postId}`} className="text-sm font-medium">
              Reason
            </label>
            <select id={`report-reason-${postId}`} name="reason" required className={inputClass}>
              <option value="">Choose a reason</option>
              {REASON_PRESETS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`report-details-${postId}`} className="text-sm font-medium">
              Details <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              id={`report-details-${postId}`}
              name="details"
              rows={3}
              maxLength={4000}
              placeholder="Add context for moderators…"
              className={textareaClass}
            />
          </div>
          {state?.error ? (
            <p className="text-destructive text-sm" role="alert">
              {state.error}
            </p>
          ) : null}
          <Button type="submit" variant="outline" size="sm" className="w-fit">
            <SubmitLabel idle="Submit report" />
          </Button>
        </form>
      )}
    </section>
  );
}
