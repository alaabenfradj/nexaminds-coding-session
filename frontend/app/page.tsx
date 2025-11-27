
async function getPosts() {
  const res = await fetch("http://localhost:4000/posts", {
    cache: "no-store",
  });

  return res.json();
}
export default async function Home() {
  const posts = await getPosts();
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Posts</h1>

      <div className="grid grid-cols-1 gap-4">
        {posts.map((p: any) => (
          <div
            key={p.id}
            className="p-4 border rounded shadow hover:bg-gray-100"
          >
            <h2 className="text-xl font-semibold">{p.title}</h2>
            <p className="text-gray-700">{p.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
