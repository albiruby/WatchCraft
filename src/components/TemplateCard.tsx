"use client";

import { useRouter } from "next/navigation";

import { cloneDesign, type Template } from "@/core/templates";
import { createId, saveDesign } from "@/lib/storage";
import { Badge, Button, Card } from "@/components/ui";
import { WatchFaceThumbnail } from "@/components/WatchFaceThumbnail";

export function TemplateCard({
  template,
  compact = false,
}: {
  template: Template;
  compact?: boolean;
}) {
  const router = useRouter();

  function applyTemplate() {
    const id = createId();
    const design = cloneDesign(template.design, template.name, id);
    saveDesign(design);
    router.push(`/studio/${id}`);
  }

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="p-3">
        <WatchFaceThumbnail design={template.design} label={`Template ${template.name}`} />
      </div>
      <div className="flex flex-1 flex-col gap-3 border-t border-line p-3.5">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-medium">{template.name}</h3>
            <span className="mono text-[10px] uppercase tracking-[0.14em] text-faint">
              FR165
            </span>
          </div>
          {compact ? null : (
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              {template.description}
            </p>
          )}
        </div>
        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 2).map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
          <Button size="sm" variant="secondary" onClick={applyTemplate}>
            Pakai
          </Button>
        </div>
      </div>
    </Card>
  );
}
