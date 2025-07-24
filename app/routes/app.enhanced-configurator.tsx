import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { ConfiguratorManager } from "../components/ConfiguratorManager";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function EnhancedConfiguratorPage() {
  return <ConfiguratorManager />;
}
