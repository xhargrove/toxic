export default function DailyQuestionPage() {
  return (
    <section className="flex flex-col gap-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Daily question</h1>
      <p className="text-muted-foreground max-w-2xl text-sm">
        Backend wiring for daily prompts is <strong>deferred</strong>. The Prisma{" "}
        <code className="text-foreground">DailyQuestion</code> model exists; scope (global vs city-based)
        requires a product decision before implementation.
      </p>
    </section>
  );
}
