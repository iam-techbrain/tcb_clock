/**
 * Generic Data Service
 * Provides universal methods to POST, UPDATE (PUT), and fetch data across any API endpoint.
 * Completely decoupled from any specific feature (weather, news, user settings, etc.).
 */

export async function postData<T = any>(endpoint: string, payload: any): Promise<T | null> {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.warn(`[dataService] POST to ${endpoint} returned status ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn(`[dataService] Error posting to ${endpoint}:`, err);
    return null;
  }
}

export async function updateData<T = any>(endpoint: string, payload: any): Promise<T | null> {
  try {
    const res = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.warn(`[dataService] PUT to ${endpoint} returned status ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn(`[dataService] Error updating ${endpoint}:`, err);
    return null;
  }
}
