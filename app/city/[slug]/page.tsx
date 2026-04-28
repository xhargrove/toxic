interface CityPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CityPage({ params }: CityPageProps) {
  const { slug } = await params;

  return <section className="py-12">City route scaffold: {slug}</section>;
}
