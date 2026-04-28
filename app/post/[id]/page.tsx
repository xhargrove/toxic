interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;

  return <section className="py-12">Post route scaffold: {id}</section>;
}
