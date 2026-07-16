import { AdminProductManager } from '@/components/admin/product-manager';

export function AdminDealBoxesTab() {
  return (
    <AdminProductManager
      title="Deal Boxes"
      addLabel="Add Deal Box"
      description="Upload and manage dedicated deal box offers separately from regular products."
      fixedCategorySlug="deal-boxes"
      fixedTags={['deal-box']}
      productFilter={(product) => product.tags.includes('deal-box')}
      emptyMessage="No deal boxes uploaded yet."
    />
  );
}
