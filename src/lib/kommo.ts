const KOMMO_DOMAIN = process.env.URL_KOMMO;
const KOMMO_TOKEN = process.env.SECRET_KEY_KOMMO;
const PIPELINE_ID = 8480507;
const LEADS_PER_PAGE = 250;

interface KommoListResponse<T> {
  _page: number;
  _links: { self: { href: string }; next?: { href: string } };
  _embedded: T;
}

interface KommoLead {
  id: number;
  name: string;
  price: number;
  responsible_user_id: number;
  group_id: number;
  status_id: number;
  pipeline_id: number;
  loss_reason_id: number | null;
  created_by: number;
  updated_by: number;
  created_at: number;
  updated_at: number;
  closed_at: number | null;
  closest_task_at: number | null;
  is_deleted: boolean;
  custom_fields_values: Array<{
    field_id: number;
    field_name: string;
    field_code: string | null;
    field_type: string;
    values: Array<{ value: unknown; enum_id?: number; enum_code?: string }>;
  }> | null;
  score: number | null;
  account_id: number;
  labor_cost: number | null;
  _embedded: {
    tags: Array<{ id: number; name: string }>;
    companies: Array<{ id: number }>;
    contacts: Array<{ id: number; is_main: boolean }>;
    loss_reason: Array<{ id: number; name: string }> | null;
  };
}

interface KommoUser {
  id: number;
  name: string;
  email: string;
}

interface KommoPipeline {
  id: number;
  name: string;
  _embedded: {
    statuses: Array<{
      id: number;
      name: string;
      sort: number;
      color: string;
      pipeline_id: number;
    }>;
  };
}

interface KommoEvent {
  id: string;
  type: string;
  entity_id: number;
  entity_type: string;
  created_by: number;
  created_at: number;
  value_after: Array<{
    lead_status?: { id: number; pipeline_id: number };
    [key: string]: unknown;
  }>;
  value_before: Array<{
    lead_status?: { id: number; pipeline_id: number };
    [key: string]: unknown;
  }>;
  account_id: number;
}

interface KommoTag {
  id: number;
  name: string;
}

async function kommoFetch<T>(
  endpoint: string,
  params?: Record<string, string>,
): Promise<T | null> {
  if (!KOMMO_DOMAIN || !KOMMO_TOKEN) {
    throw new Error(
      "Missing KOMMO credentials: URL_KOMMO and SECRET_KEY_KOMMO are required",
    );
  }

  const url = new URL(`https://${KOMMO_DOMAIN}/api/v4${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) =>
      url.searchParams.set(key, value),
    );
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${KOMMO_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (res.status === 204) return null;

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(
      `Kommo API error ${res.status}: ${errorBody}`,
    );
  }

  return res.json() as Promise<T>;
}

export async function fetchLeadsPage(
  page: number,
  updatedAfter?: number,
): Promise<{ leads: KommoLead[]; hasNext: boolean }> {
  const params: Record<string, string> = {
    page: page.toString(),
    limit: LEADS_PER_PAGE.toString(),
    "filter[pipeline_id]": PIPELINE_ID.toString(),
    with: "contacts",
  };

  if (updatedAfter) {
    params["filter[updated_at][from]"] = updatedAfter.toString();
  }

  const data = await kommoFetch<
    KommoListResponse<{ leads: KommoLead[] }>
  >("/leads", params);

  if (!data) return { leads: [], hasNext: false };

  return {
    leads: data._embedded.leads,
    hasNext: !!data._links.next,
  };
}

export async function fetchEventsPage(
  page: number,
  createdAfter?: number,
): Promise<{ events: KommoEvent[]; hasNext: boolean }> {
  const params: Record<string, string> = {
    page: page.toString(),
    limit: "100",
    "filter[type]": "lead_status_changed",
    "filter[entity]": "lead",
  };

  if (createdAfter) {
    params["filter[created_at][from]"] = createdAfter.toString();
  }

  const data = await kommoFetch<
    KommoListResponse<{ events: KommoEvent[] }>
  >("/events", params);

  if (!data) return { events: [], hasNext: false };

  return {
    events: data._embedded.events,
    hasNext: !!data._links.next,
  };
}

export async function fetchUsers(): Promise<KommoUser[]> {
  const data = await kommoFetch<
    KommoListResponse<{ users: KommoUser[] }>
  >("/users");

  if (!data) return [];
  return data._embedded.users;
}

export async function fetchPipelineStatuses(): Promise<
  KommoPipeline["_embedded"]["statuses"]
> {
  const data = await kommoFetch<KommoPipeline>(
    `/leads/pipelines/${PIPELINE_ID}`,
  );

  if (!data) return [];
  return data._embedded.statuses;
}

export async function fetchTags(): Promise<KommoTag[]> {
  const allTags: KommoTag[] = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const data = await kommoFetch<
      KommoListResponse<{ tags: KommoTag[] }>
    >("/leads/tags", { page: page.toString(), limit: "250" });

    if (!data) break;

    allTags.push(...data._embedded.tags);
    hasNext = !!data._links.next;
    page++;
  }

  return allTags;
}

export type { KommoLead, KommoUser, KommoEvent, KommoTag };
export { PIPELINE_ID };
