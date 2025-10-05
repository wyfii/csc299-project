// Simple in-memory cache to prevent duplicate requests
const cache = new Map<string, { data: string | null; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

// Server-side utility to fetch multisig from Firestore using REST API
export async function getMultisigFromFirestore(walletAddress: string): Promise<string | null> {
  // Check cache first
  const cached = cache.get(walletAddress);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const projectId = "nova-a42e0";
    const apiKey = "AIzaSyCZsi5RaDwItGNf_KPee_2d9EsNJDtLsDI";
    
    // Query the multisigs subcollection using Firestore REST API
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${walletAddress}/multisigs?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 30 }, // Cache and revalidate every 30 seconds
    });
    
    if (!response.ok) {
      console.error(`Firestore API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.documents || data.documents.length === 0) {
      console.log(`No multisigs found for wallet: ${walletAddress}`);
      cache.set(walletAddress, { data: null, timestamp: Date.now() });
      return null;
    }
    
    // Extract multi-sig address from the document name
    // Document name format: "projects/{project}/databases/(default)/documents/users/{wallet}/multisigs/{multi-sig}"
    // Choose first document by default. Server routes may override via x-multisig
    const documentName = data.documents[0].name;
    const multisigAddress = documentName.split('/').pop();
    
    // Cache the result
    cache.set(walletAddress, { data: multisigAddress || null, timestamp: Date.now() });
    
    console.log(`Found multisig for ${walletAddress}: ${multisigAddress}`);
    return multisigAddress;
  } catch (error) {
    console.error("Error fetching multi-sig from Firestore:", error);
    // Don't cache errors
    return null;
  }
}
