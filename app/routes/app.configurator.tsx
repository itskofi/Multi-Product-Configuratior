import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { ConfiguratorForm } from "../components/ConfiguratorForm";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  
  try {
    const formData = await request.formData();
    const itemsData = formData.get("items");
    
    if (!itemsData || typeof itemsData !== "string") {
      return json({ error: "No items provided" }, { status: 400 });
    }

    let items;
    try {
      items = JSON.parse(itemsData);
    } catch (parseError) {
      return json({ error: "Invalid items format" }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return json({ error: "No valid items to add to cart" }, { status: 400 });
    }

    // For now, we'll simulate the cart operation
    // In a real implementation, this would:
    // 1. Get the shop domain from the session
    // 2. Make a request to the shop's cart API
    // 3. Handle authentication and CORS issues
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock successful response
    return json({ 
      success: true, 
      message: `Successfully added ${items.length} items to cart`,
      items: items 
    });

  } catch (error) {
    console.error("Cart action error:", error);
    return json(
      { error: "Failed to add items to cart" }, 
      { status: 500 }
    );
  }
};

export default function ConfiguratorPage() {
  const actionData = useActionData<typeof action>();

  return <ConfiguratorForm />;
}
