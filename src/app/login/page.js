import { redirect } from "next/navigation";

export default async function LoginRedirectPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(resolvedSearchParams || {})) {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined) params.append(key, item);
      });
    } else if (value !== undefined) {
      params.set(key, value);
    }
  }

  const query = params.toString();
  redirect(query ? `/admin?${query}` : "/admin");
}
