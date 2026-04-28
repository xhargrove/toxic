export interface AppUser {
  id: string;
  email: string;
  username: string | null;
}

export interface Post {
  id: string;
  title: string;
  body: string;
  citySlug: string;
  authorId: string;
  createdAt: string;
}
