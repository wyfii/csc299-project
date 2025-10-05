import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  // Set the "x-pathname" header
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);

  // Pass wallet address from cookie to header (for Firestore queries)
  const walletAddress = req.cookies.get("x-wallet")?.value;
  if (walletAddress) {
    requestHeaders.set("x-wallet", walletAddress);
  }

  const rpcUrl = req.cookies.get("x-rpc-url")?.value || process.env.NEXT_PUBLIC_RPC_URL;
  if (rpcUrl) {
    requestHeaders.set("x-rpc-url", rpcUrl);
  }

  const vaultIndex = req.cookies.get("x-vault-index")?.value;
  if (vaultIndex) {
    requestHeaders.set("x-vault-index", vaultIndex);
  }

  // Propagate selected multisig from cookie to header
  const selectedMultisig = req.cookies.get("x-multisig")?.value;
  if (selectedMultisig) {
    requestHeaders.set("x-multisig", selectedMultisig);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
