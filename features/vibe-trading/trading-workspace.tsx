"use client";

import { useActionState, useState } from "react";
import { BarChart3, BrainCircuit, CandlestickChart, LineChart, NotebookPen, Plus, Sparkles, Target, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FloatingStatCard } from "@/components/shared/floating-stat-card";
import { PremiumCard } from "@/components/shared/premium-card";
import { SurfacePanel } from "@/components/shared/surface-panel";
import { createBacktestAction, createTradingIdeaAction, createWatchlistAction, generateTradingIdeaAction } from "@/features/vibe-trading/actions";
import type { TradingActionState, TradingModuleData } from "@/features/vibe-trading/types";
import type { TradingBacktestRow, TradingIdeaRow, TradingWatchlistRow } from "@/types/database";

type TradingWorkspaceProps = {
  data: TradingModuleData;
};

const initialState: TradingActionState = { ok: false, message: "" };

const marketOptions = [
  ["crypto", "Crypto"],
  ["us_stock", "US Stock"],
  ["vn_stock", "VN Stock"],
  ["forex", "Forex"],
  ["futures", "Futures"],
  ["other", "Other"]
];

function percent(value: number | null | undefined) {
  const numberValue = Number(value ?? 0);
  return `${numberValue.toFixed(2)}%`;
}

function dateLabel(value: string) {
  return new Date(value).toLocaleDateString("vi-VN");
}

function ActionMessage({ state }: { state: TradingActionState }) {
  if (!state.message) return null;
  return (
    <p className={state.ok ? "text-xs font-semibold text-cyan-700" : "text-xs font-semibold text-rose-600"}>
      {state.message}
    </p>
  );
}

function WatchlistForm() {
  const [state, action, pending] = useActionState(createWatchlistAction, initialState);

  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr]">
        <Input name="symbol" placeholder="BTC-USDT" required />
        <Select name="market" defaultValue="crypto">
          {marketOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </Select>
        <Select name="bias" defaultValue="neutral">
          <option value="bullish">Bullish</option>
          <option value="bearish">Bearish</option>
          <option value="neutral">Neutral</option>
        </Select>
      </div>
      <Input name="alert_price" type="number" step="0.000001" placeholder="Gia can theo doi" />
      <Textarea name="thesis" className="min-h-24" placeholder="Ly do dua vao watchlist" />
      <div className="flex items-center justify-between gap-3">
        <ActionMessage state={state} />
        <Button type="submit" size="sm" disabled={pending}>
          <Plus />
          Them
        </Button>
      </div>
    </form>
  );
}

function IdeaForm() {
  const [state, action, pending] = useActionState(createTradingIdeaAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1.5fr_0.8fr_0.8fr_0.7fr]">
        <Input name="title" placeholder="Ten y tuong" required />
        <Input name="symbol" placeholder="ETH-USDT" />
        <Select name="market" defaultValue="crypto">
          {marketOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </Select>
        <Input name="timeframe" defaultValue="4H" />
      </div>
      <Textarea
        name="prompt"
        className="min-h-32"
        placeholder="Mo ta y tuong nhu Vibe Trading: dieu kien vao lenh, thoat lenh, du lieu can so sanh, rui ro can kiem tra..."
        required
      />
      <div className="grid gap-3 md:grid-cols-2">
        <Textarea name="thesis" className="min-h-28" placeholder="Thesis / ly do co hoi" />
        <Textarea name="risk_notes" className="min-h-28" placeholder="Rui ro, dieu kien vo hieu hoa y tuong" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <ActionMessage state={state} />
        <Button type="submit" disabled={pending}>
          <BrainCircuit />
          Luu y tuong
        </Button>
      </div>
    </form>
  );
}

function AiIdeaForm() {
  const [state, action, pending] = useActionState(generateTradingIdeaAction, initialState);

  return (
    <form action={action} className="space-y-4 rounded-[24px] border border-primary-indigo/10 bg-white/60 p-4">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-2xl bg-[image:var(--gradient-primary)] text-white">
          <Sparkles className="size-4" />
        </span>
        <div>
          <h3 className="text-sm font-bold text-text-primary">Gemini analyst</h3>
          <p className="text-xs text-text-secondary">Tao thesis, risk notes va test plan tu prompt.</p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-[1.5fr_0.8fr_0.8fr_0.7fr]">
        <Input name="title" placeholder="Ten y tuong" required />
        <Input name="symbol" placeholder="BTC-USDT" />
        <Select name="market" defaultValue="crypto">
          {marketOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </Select>
        <Input name="timeframe" defaultValue="4H" />
      </div>
      <Textarea
        name="prompt"
        className="min-h-32"
        placeholder="Vi du: Kiem tra chien luoc breakout khi BTC dong nen 4H tren resistance, volume tang, RSI khong qua mua..."
        required
      />
      <div className="flex items-center justify-between gap-3">
        <ActionMessage state={state} />
        <Button type="submit" disabled={pending}>
          <Sparkles />
          {pending ? "Dang goi Gemini..." : "Tao bang Gemini"}
        </Button>
      </div>
    </form>
  );
}

function BacktestForm() {
  const [state, action, pending] = useActionState(createBacktestAction, initialState);

  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 md:grid-cols-[1.4fr_0.8fr_0.7fr]">
        <Input name="title" placeholder="Ten backtest" required />
        <Input name="symbol" placeholder="BTC-USDT" />
        <Input name="timeframe" defaultValue="4H" />
      </div>
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Input name="period_label" defaultValue="Manual" />
        <Input name="total_return" type="number" step="0.01" placeholder="Return %" />
        <Input name="max_drawdown" type="number" step="0.01" placeholder="Max DD %" />
        <Input name="sharpe" type="number" step="0.01" placeholder="Sharpe" />
        <Input name="win_rate" type="number" step="0.01" placeholder="Win %" />
        <Input name="trade_count" type="number" step="1" placeholder="Trades" />
      </div>
      <Select name="verdict" defaultValue="observe">
        <option value="promising">Promising</option>
        <option value="observe">Observe</option>
        <option value="reject">Reject</option>
      </Select>
      <Textarea name="notes" className="min-h-24" placeholder="Nhan xet sau khi test" />
      <div className="flex items-center justify-between gap-3">
        <ActionMessage state={state} />
        <Button type="submit" variant="secondary" disabled={pending}>
          <NotebookPen />
          Luu ket qua
        </Button>
      </div>
    </form>
  );
}

function WatchlistItem({ item }: { item: TradingWatchlistRow }) {
  return (
    <div className="rounded-[20px] border border-border-soft bg-white/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-bold text-text-primary">{item.symbol}</p>
          <p className="text-xs text-text-secondary">{item.market}</p>
        </div>
        <Badge variant={item.bias === "bullish" ? "default" : "neutral"}>{item.bias}</Badge>
      </div>
      {item.alert_price ? <p className="mt-3 text-sm font-semibold text-text-primary">Alert: {item.alert_price}</p> : null}
      {item.thesis ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-text-secondary">{item.thesis}</p> : null}
    </div>
  );
}

function IdeaItem({ item }: { item: TradingIdeaRow }) {
  return (
    <div className="rounded-[22px] border border-border-soft bg-white/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-text-primary">{item.title}</p>
          <p className="mt-1 text-xs text-text-secondary">{item.symbol ?? item.market} · {item.timeframe} · {dateLabel(item.updated_at)}</p>
        </div>
        <Badge variant="neutral">{item.status}</Badge>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-text-secondary">{item.prompt}</p>
    </div>
  );
}

function BacktestItem({ item }: { item: TradingBacktestRow }) {
  return (
    <div className="rounded-[22px] border border-border-soft bg-white/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-text-primary">{item.title}</p>
          <p className="mt-1 text-xs text-text-secondary">{item.symbol ?? "Portfolio"} · {item.timeframe} · {item.period_label}</p>
        </div>
        <Badge variant={item.verdict === "promising" ? "default" : "neutral"}>{item.verdict}</Badge>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs md:grid-cols-5">
        <span className="rounded-2xl bg-white/72 px-3 py-2 text-text-secondary">Return <b className="block text-text-primary">{percent(item.total_return)}</b></span>
        <span className="rounded-2xl bg-white/72 px-3 py-2 text-text-secondary">Max DD <b className="block text-text-primary">{percent(item.max_drawdown)}</b></span>
        <span className="rounded-2xl bg-white/72 px-3 py-2 text-text-secondary">Sharpe <b className="block text-text-primary">{Number(item.sharpe).toFixed(2)}</b></span>
        <span className="rounded-2xl bg-white/72 px-3 py-2 text-text-secondary">Win <b className="block text-text-primary">{percent(item.win_rate)}</b></span>
        <span className="rounded-2xl bg-white/72 px-3 py-2 text-text-secondary">Trades <b className="block text-text-primary">{item.trade_count}</b></span>
      </div>
    </div>
  );
}

function IdeaBoard({ ideas }: { ideas: TradingIdeaRow[] }) {
  const [isAdding, setIsAdding] = useState(false);

  return (
    <PremiumCard
      hover={false}
      className="border-primary-indigo/25 bg-[linear-gradient(135deg,rgba(91,108,255,0.18),rgba(103,232,249,0.14)_46%,rgba(255,184,107,0.18))] shadow-[0_28px_90px_rgba(91,108,255,0.18)]"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-[image:var(--gradient-primary)] text-white shadow-[0_18px_42px_rgba(91,108,255,0.28)]">
            <BrainCircuit className="size-5" />
          </span>
          <div>
            <h2 className="text-3xl font-bold text-text-primary">Idea board</h2>
            <p className="mt-1 text-sm leading-6 text-text-secondary">Các setup, prompt và thesis trading đang được theo dõi.</p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => setIsAdding((current) => !current)}
          aria-expanded={isAdding}
        >
          <Plus />
          Thêm thủ công
        </Button>
      </div>

      {isAdding ? (
        <div className="mt-5 rounded-[24px] border border-white/70 bg-white/72 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
          <IdeaForm />
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {ideas.length ? ideas.map((item) => <IdeaItem key={item.id} item={item} />) : (
          <SurfacePanel>
            <p className="text-sm font-semibold text-text-primary">Chua co y tuong nao.</p>
            <p className="mt-1 text-sm text-text-secondary">Bam dau cong de them y tuong trading dau tien.</p>
          </SurfacePanel>
        )}
      </div>
    </PremiumCard>
  );
}

export function TradingWorkspace({ data }: TradingWorkspaceProps) {
  const promisingCount = data.backtests.filter((item) => item.verdict === "promising").length;
  const activeSymbols = data.watchlist.filter((item) => item.is_active).length;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <FloatingStatCard icon={Target} label="Watchlist" value={String(activeSymbols)} helper="Tai san dang theo doi." tone="cyan" />
        <FloatingStatCard icon={BrainCircuit} label="Trading ideas" value={String(data.ideas.length)} helper="Prompt va thesis da luu." tone="gold" />
        <FloatingStatCard icon={TrendingUp} label="Promising tests" value={String(promisingCount)} helper="Backtest dang co tin hieu tot." />
      </section>

      <IdeaBoard ideas={data.ideas} />

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <PremiumCard hover={false}>
          <div className="flex items-center gap-3">
            <CandlestickChart className="size-5 text-primary-indigo" />
            <h2 className="text-2xl font-bold text-text-primary">Research prompt</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-text-secondary">Dung Gemini de tao thesis, risk notes va test plan tu prompt trading.</p>
          <div className="mt-5 space-y-5">
            <AiIdeaForm />
          </div>
        </PremiumCard>

        <PremiumCard hover={false}>
          <div className="flex items-center gap-3">
            <LineChart className="size-5 text-primary-indigo" />
            <h2 className="text-2xl font-bold text-text-primary">Backtest journal</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-text-secondary">Nhap ket qua test tay hoac tu TradingView/Excel, sau nay co the noi engine tu dong.</p>
          <div className="mt-5">
            <BacktestForm />
          </div>
        </PremiumCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <PremiumCard hover={false}>
          <div className="flex items-center gap-3">
            <BarChart3 className="size-5 text-primary-indigo" />
            <h2 className="text-2xl font-bold text-text-primary">Watchlist</h2>
          </div>
          <div className="mt-5">
            <WatchlistForm />
          </div>
          <div className="mt-5 grid gap-3">
            {data.watchlist.length ? data.watchlist.map((item) => <WatchlistItem key={item.id} item={item} />) : (
              <SurfacePanel>
                <p className="text-sm font-semibold text-text-primary">Chua co tai san nao.</p>
                <p className="mt-1 text-sm text-text-secondary">Them BTC, ETH, AAPL hoac cap forex ban muon theo doi.</p>
              </SurfacePanel>
            )}
          </div>
        </PremiumCard>

        <div className="space-y-6">
          <PremiumCard hover={false}>
            <h2 className="text-2xl font-bold text-text-primary">Ket qua gan day</h2>
            <div className="mt-5 space-y-3">
              {data.backtests.length ? data.backtests.map((item) => <BacktestItem key={item.id} item={item} />) : (
                <SurfacePanel>
                  <p className="text-sm font-semibold text-text-primary">Chua co backtest nao.</p>
                  <p className="mt-1 text-sm text-text-secondary">Nhap ket qua test dau tien de tao baseline.</p>
                </SurfacePanel>
              )}
            </div>
          </PremiumCard>
        </div>
      </section>
    </div>
  );
}
