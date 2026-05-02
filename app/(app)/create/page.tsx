import { CreatePostForm } from "./create-post-form";

export default function CreatePage() {
  return (
    <section className="flex flex-col gap-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create post</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Uses your Prisma user as author and an existing city slug.
        </p>
      </div>
      <CreatePostForm />
    </section>
  );
}
