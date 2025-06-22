// make the ABI import works
declare module "*.json" {
  const value: Record<string, unknown>;
  export default value;
}
