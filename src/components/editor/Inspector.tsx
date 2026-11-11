"use client";

import { Badge, Button } from "@/components/ui";
import { Copy, Trash } from "@/components/icons";
import { elementTitle } from "@/core/schema";
import { FR165 } from "@/core/devices";
import { useEditor, useSelectedElement, type AlignDirection } from "@/stores/editor";
import {
  ColorField,
  Field,
  NumberField,
  Section,
  SegmentedField,
  SelectField,
  TextField,
} from "./fields";

const TEXT_METRICS = [
  { value: "time", label: "Waktu" },
  { value: "date", label: "Tanggal" },
  { value: "battery", label: "Baterai" },
  { value: "steps", label: "Langkah" },
  { value: "heartRate", label: "Detak" },
  { value: "calories", label: "Kalori" },
  { value: "distance", label: "Jarak" },
  { value: "notifications", label: "Notif" },
  { value: "weather", label: "Suhu" },
  { value: "label", label: "Teks bebas" },
] as const;

const ARC_METRICS = [
  { value: "battery", label: "Baterai" },
  { value: "steps", label: "Langkah" },
  { value: "heartRate", label: "Detak" },
] as const;

const ALIGNMENTS: Array<[string, AlignDirection]> = [
  ["Kiri", "left"],
  ["Tengah", "hcenter"],
  ["Kanan", "right"],
  ["Atas", "top"],
  ["Tengah", "vcenter"],
  ["Bawah", "bottom"],
];

function AlignGrid({ onAlign }: { onAlign: (direction: AlignDirection) => void }) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {ALIGNMENTS.map(([label, direction]) => (
        <button
          key={`${label}-${direction}`}
          type="button"
          onClick={() => onAlign(direction)}
          className="h-7 rounded border border-line bg-raised text-[10px] font-medium text-muted transition-colors hover:border-line-strong hover:text-ink"
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function Inspector() {
  const element = useSelectedElement();
  const design = useEditor((state) => state.design);
  const update = useEditor((state) => state.update);
  const remove = useEditor((state) => state.remove);
  const duplicate = useEditor((state) => state.duplicate);
  const setBackground = useEditor((state) => state.setBackground);
  const toggleVisible = useEditor((state) => state.toggleVisible);
  const toggleLocked = useEditor((state) => state.toggleLocked);
  const selectedIds = useEditor((state) => state.selectedIds);
  const align = useEditor((state) => state.align);
  const distribute = useEditor((state) => state.distribute);
  const duplicateSelected = useEditor((state) => state.duplicateSelected);
  const removeSelected = useEditor((state) => state.removeSelected);

  if (selectedIds.length > 1) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-line px-3.5">
          <div>
            <p className="text-[12px] font-medium">Pilihan banyak</p>
            <p className="mono text-[9px] text-faint">{selectedIds.length} elemen aktif</p>
          </div>
          <Badge tone="accent">{selectedIds.length}</Badge>
        </header>

        <div className="scroll-slim min-h-0 flex-1 overflow-y-auto">
          <Section title="Rata ke kanvas">
            <AlignGrid onAlign={align} />
          </Section>

          <Section title="Distribusi jarak">
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                size="sm"
                variant="secondary"
                disabled={selectedIds.length < 3}
                onClick={() => distribute("horizontal")}
              >
                Horizontal
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={selectedIds.length < 3}
                onClick={() => distribute("vertical")}
              >
                Vertikal
              </Button>
            </div>
            {selectedIds.length < 3 ? (
              <p className="pt-1.5 text-[10px] leading-relaxed text-faint">
                Distribusi butuh minimal 3 elemen.
              </p>
            ) : null}
          </Section>

          <div className="grid grid-cols-2 gap-2 p-3.5">
            <Button size="sm" variant="secondary" onClick={duplicateSelected}>
              <Copy size={13} />
              Duplikat
            </Button>
            <Button size="sm" variant="danger" onClick={removeSelected}>
              <Trash size={13} />
              Hapus
            </Button>
          </div>

          <div className="px-3.5 pb-4">
            <p className="text-[10px] leading-relaxed text-faint">
              Shift klik di kanvas atau layer untuk menambah dan mengurangi pilihan.
              Tarik salah satu elemen untuk memindahkan semuanya sekaligus.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!element) {
    return (
      <div className="scroll-slim flex-1 overflow-y-auto">
        <header className="flex h-11 items-center justify-between border-b border-line px-3.5">
          <h2 className="text-[13px] font-medium">Inspector</h2>
          <Badge>Kanvas</Badge>
        </header>
        <Section title="Kanvas">
          <ColorField
            label="Latar"
            value={design.background}
            onChange={(color) => setBackground(color)}
          />
          <Field label="Ukuran">
            <span className="mono text-[10px] text-muted">390 x 390</span>
          </Field>
          <Field label="Perangkat">
            <span className="mono text-[10px] text-muted">{FR165.code}</span>
          </Field>
        </Section>
        <div className="px-3.5 py-4">
          <p className="text-[12px] leading-relaxed text-muted">
            Pilih elemen di kanvas atau di panel layer untuk mengubah propertinya.
            Klik area kosong untuk kembali ke pengaturan kanvas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-line px-3.5">
        <div className="min-w-0">
          <p className="truncate text-[12px] font-medium">{elementTitle(element)}</p>
          <p className="mono truncate text-[9px] text-faint">
            {element.type} / {element.id.slice(0, 14)}
          </p>
        </div>
        <Badge tone={element.visible ? "accent" : "neutral"}>
          {element.visible ? "Tampil" : "Sembunyi"}
        </Badge>
      </header>

      <div className="scroll-slim min-h-0 flex-1 overflow-y-auto">
        <Section title="Posisi">
          <NumberField
            label={element.type === "text" ? "X pusat" : "X"}
            value={element.x}
            onChange={(value) => update(element.id, { x: value })}
          />
          <NumberField
            label={element.type === "text" ? "Y pusat" : "Y"}
            value={element.y}
            onChange={(value) => update(element.id, { y: value })}
          />
          {element.type !== "text" ? (
            <>
              <NumberField
                label="Lebar"
                value={element.w}
                min={1}
                max={390}
                onChange={(value) => update(element.id, { w: value })}
              />
              <NumberField
                label="Tinggi"
                value={element.h}
                min={1}
                max={390}
                onChange={(value) => update(element.id, { h: value })}
              />
            </>
          ) : (
            <p className="pt-1 text-[10px] leading-relaxed text-faint">
              Teks digambar dengan titik pusat di X dan Y.
            </p>
          )}
        </Section>

        <Section title="Rata kanvas">
          <AlignGrid onAlign={align} />
        </Section>

        {element.type === "text" ? (
          <Section title="Teks">
            <SelectField
              label="Sumber"
              value={element.metric}
              options={[...TEXT_METRICS]}
              onChange={(value) => update(element.id, { metric: value })}
            />
            {element.metric === "label" ? (
              <TextField
                label="Isi"
                value={element.text}
                maxLength={40}
                onChange={(value) => update(element.id, { text: value })}
              />
            ) : null}
            <NumberField
              label="Ukuran"
              value={element.size}
              min={8}
              max={180}
              onChange={(value) => update(element.id, { size: value })}
            />
            <SegmentedField
              label="Font"
              value={element.family}
              options={[
                { value: "sans", label: "Sans" },
                { value: "mono", label: "Mono" },
                { value: "digits", label: "Digit" },
              ]}
              onChange={(value) => update(element.id, { family: value })}
            />
            <SegmentedField
              label="Bobot"
              value={element.weight}
              options={[
                { value: "regular", label: "Reg" },
                { value: "medium", label: "Med" },
                { value: "bold", label: "Bold" },
              ]}
              onChange={(value) => update(element.id, { weight: value })}
            />
            <SegmentedField
              label="Rata"
              value={element.align}
              options={[
                { value: "left", label: "Kiri" },
                { value: "center", label: "Tengah" },
                { value: "right", label: "Kanan" },
              ]}
              onChange={(value) => update(element.id, { align: value })}
            />
            <NumberField
              label="Tracking"
              value={element.tracking}
              min={-2}
              max={8}
              step={0.5}
              suffix="px"
              onChange={(value) => update(element.id, { tracking: value })}
            />
            <ColorField
              label="Warna"
              value={element.color}
              onChange={(value) => update(element.id, { color: value })}
            />
          </Section>
        ) : null}

        {element.type === "shape" ? (
          <Section title="Bentuk">
            <SegmentedField
              label="Jenis"
              value={element.shape}
              options={[
                { value: "rect", label: "Kotak" },
                { value: "circle", label: "Bulat" },
              ]}
              onChange={(value) => update(element.id, { shape: value })}
            />
            {element.shape === "rect" ? (
              <NumberField
                label="Sudut"
                value={element.radius}
                min={0}
                max={195}
                suffix="px"
                onChange={(value) => update(element.id, { radius: value })}
              />
            ) : null}
            <ColorField
              label="Isi"
              value={element.fill}
              onChange={(value) => update(element.id, { fill: value })}
            />
            {element.stroke ? (
              <>
                <ColorField
                  label="Garis"
                  value={element.stroke}
                  onChange={(value) => update(element.id, { stroke: value })}
                />
                <NumberField
                  label="Tebal garis"
                  value={element.strokeWidth}
                  min={0}
                  max={16}
                  suffix="px"
                  onChange={(value) => update(element.id, { strokeWidth: value })}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-1 w-full"
                  onClick={() => update(element.id, { stroke: null, strokeWidth: 0 })}
                >
                  Hapus garis
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                className="mt-1 w-full"
                onClick={() => update(element.id, { stroke: "#FF7A1A", strokeWidth: 1 })}
              >
                Tambah garis
              </Button>
            )}
          </Section>
        ) : null}

        {element.type === "arc" ? (
          <Section title="Busur">
            <SelectField
              label="Sumber"
              value={element.metric}
              options={[...ARC_METRICS]}
              onChange={(value) => update(element.id, { metric: value })}
            />
            <NumberField
              label="Nilai maks"
              value={element.max}
              min={1}
              max={100000}
              onChange={(value) => update(element.id, { max: value })}
            />
            <NumberField
              label="Tebal"
              value={element.width}
              min={1}
              max={24}
              suffix="px"
              onChange={(value) => update(element.id, { width: value })}
            />
            <NumberField
              label="Mulai"
              value={element.startAngle}
              min={-360}
              max={360}
              suffix="deg"
              onChange={(value) => update(element.id, { startAngle: value })}
            />
            <NumberField
              label="Bentang"
              value={element.sweep}
              min={1}
              max={360}
              suffix="deg"
              onChange={(value) => update(element.id, { sweep: value })}
            />
            <SegmentedField
              label="Ujung"
              value={element.cap}
              options={[
                { value: "butt", label: "Datar" },
                { value: "round", label: "Bulat" },
              ]}
              onChange={(value) => update(element.id, { cap: value })}
            />
            <ColorField
              label="Warna isi"
              value={element.color}
              onChange={(value) => update(element.id, { color: value })}
            />
            <ColorField
              label="Rel"
              value={element.track}
              onChange={(value) => update(element.id, { track: value })}
            />
          </Section>
        ) : null}

        <Section title="Status">
          <SegmentedField
            label="Visibilitas"
            value={element.visible ? "show" : "hide"}
            options={[
              { value: "show", label: "Tampil" },
              { value: "hide", label: "Sembunyi" },
            ]}
            onChange={() => toggleVisible(element.id)}
          />
          <SegmentedField
            label="Kunci"
            value={element.locked ? "locked" : "open"}
            options={[
              { value: "open", label: "Bebas" },
              { value: "locked", label: "Kunci" },
            ]}
            onChange={() => toggleLocked(element.id)}
          />
        </Section>

        <div className="grid grid-cols-2 gap-2 p-3.5">
          <Button size="sm" variant="secondary" onClick={() => duplicate(element.id)}>
            <Copy size={13} />
            Duplikat
          </Button>
          <Button size="sm" variant="danger" onClick={() => remove(element.id)}>
            <Trash size={13} />
            Hapus
          </Button>
        </div>
      </div>
    </div>
  );
}
