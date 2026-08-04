import {
  InvestigationInfo,
  QueryResponse,
  ReplayResponse
} from "../types";

const getApiBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  if (!url.endsWith("/api/v1")) {
    url = `${url}/api/v1`;
  }
  return url;
};

const API_BASE_URL = getApiBaseUrl();

export async function getSampleInvestigations(): Promise<InvestigationInfo[]> {
  const res = await fetch(`${API_BASE_URL}/investigations/samples`);
  if (!res.ok) {
    let msg = "Failed to fetch sample datasets";
    try { const d = await res.json(); if (d.detail) msg = d.detail; } catch(_) {}
    throw new Error(msg);
  }
  return res.json();
}

export async function listInvestigations(): Promise<InvestigationInfo[]> {
  const res = await fetch(`${API_BASE_URL}/investigations`);
  if (!res.ok) {
    let msg = "Failed to fetch investigations";
    try { const d = await res.json(); if (d.detail) msg = d.detail; } catch(_) {}
    throw new Error(msg);
  }
  return res.json();
}

export async function createInvestigation(title: string, description: string): Promise<InvestigationInfo> {
  const res = await fetch(`${API_BASE_URL}/investigations?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`, {
    method: "POST"
  });
  if (!res.ok) {
    let msg = "Failed to create investigation";
    try { const d = await res.json(); if (d.detail) msg = d.detail; } catch(_) {}
    throw new Error(msg);
  }
  return res.json();
}

export async function uploadLogFiles(invId: string, files: File[]): Promise<InvestigationInfo> {
  const formData = new FormData();
  files.forEach(file => formData.append("files", file));

  const res = await fetch(`${API_BASE_URL}/investigations/${invId}/upload`, {
    method: "POST",
    body: formData
  });
  if (!res.ok) {
    let msg = "Failed to upload log files";
    try { const d = await res.json(); if (d.detail) msg = d.detail; } catch(_) {}
    throw new Error(msg);
  }
  return res.json();
}

export async function executeQuery(invId: string, question: string): Promise<QueryResponse> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof window !== "undefined") {
    const userKey = localStorage.getItem("paritok_api_key");
    if (userKey) {
      headers["X-Paritok-Key"] = userKey;
    }
    const groqKey = localStorage.getItem("groq_api_key");
    if (groqKey) {
      headers["X-Groq-Key"] = groqKey;
    }
  }

  const res = await fetch(`${API_BASE_URL}/investigations/${invId}/query`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({ question, investigation_id: invId })
  });
  if (!res.ok) {
    let msg = "Failed to execute investigation query";
    try { const d = await res.json(); if (d.detail) msg = d.detail; } catch(_) {}
    throw new Error(msg);
  }
  return res.json();
}

export async function executeInvestigation(question: string, invId: string = "demo-apt29-compromise"): Promise<QueryResponse> {
  return executeQuery(invId, question);
}

export async function uploadLogs(files: File[], title: string = "Custom Upload"): Promise<{ investigation: InvestigationInfo; response: QueryResponse }> {
  const inv = await createInvestigation(title, `Uploaded ${files.length} log files`);
  await uploadLogFiles(inv.id, files);
  const resp = await executeQuery(inv.id, "Analyze all security events and identify root cause threat");
  return { investigation: inv, response: resp };
}

export async function getQueryReplay(invId: string, queryId: string): Promise<ReplayResponse> {
  const res = await fetch(`${API_BASE_URL}/investigations/${invId}/replay/${queryId}`);
  if (!res.ok) {
    let msg = "Failed to fetch replay trace";
    try { const d = await res.json(); if (d.detail) msg = d.detail; } catch(_) {}
    throw new Error(msg);
  }
  return res.json();
}
