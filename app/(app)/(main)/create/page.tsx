import { CreatePostForm } from "./create-post-form";

export default function CreatePage() {
  return (
    <section className="flex flex-col gap-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create post</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Requires an active category and city (run <code className="text-foreground">npm run prisma:seed</code> — then use city slug{" "}
          <code className="text-foreground">demo-city</code>).
        </p>
      </div>
      <CreatePostForm />
    </section>
  );
}
