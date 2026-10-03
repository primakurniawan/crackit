import type { BillSplitConfig, Player, PlayerBillShare } from '@/types';

export function calculateBillShares(
  players: Player[],
  config?: BillSplitConfig
): PlayerBillShare[] {
  if (!config || !config.enabled || players.length === 0 || config.totalAmount <= 0) {
    return players.map((p, i) => ({
      playerId: p.id,
      playerName: p.name,
      score: p.score,
      rank: i + 1,
      amountOwed: 0,
      percentage: 0,
    }));
  }

  const sorted = [...players].sort((a, b) => b.score - a.score);
  const totalBill = config.totalAmount;
  const n = sorted.length;

  // Calculate ranks handling ties
  const ranks: number[] = [];
  let currentRank = 1;
  for (let i = 0; i < n; i++) {
    if (i > 0 && sorted[i].score < sorted[i - 1].score) {
      currentRank = i + 1;
    }
    ranks.push(currentRank);
  }

  let shares: { playerId: string; amountOwed: number; percentage: number }[] = [];

  if (config.splitMode === 'loser_pays_all') {
    // Find the minimum score
    const minScore = sorted[sorted.length - 1].score;
    const losers = sorted.filter((p) => p.score === minScore);
    const loserAmount = totalBill / losers.length;

    shares = sorted.map((p) => {
      const isLoser = p.score === minScore;
      const owed = isLoser ? loserAmount : 0;
      return {
        playerId: p.id,
        amountOwed: Math.round(owed * 100) / 100,
        percentage: isLoser ? 100 / losers.length : 0,
      };
    });
  } else if (config.splitMode === 'proportional') {
    // Split based on points lost/gap from top score + base share
    const maxScore = sorted[0].score;
    // Deficit for each player = (maxScore - score) + 1 (so even top player has a weight if all scores equal)
    const deficits = sorted.map((p) => Math.max(0, maxScore - p.score) + (maxScore === sorted[n - 1].score ? 1 : 0));
    const totalDeficit = deficits.reduce((a, b) => a + b, 0);

    shares = sorted.map((p, idx) => {
      const weight = deficits[idx];
      const pct = totalDeficit > 0 ? (weight / totalDeficit) * 100 : 100 / n;
      const owed = (pct / 100) * totalBill;
      return {
        playerId: p.id,
        amountOwed: Math.round(owed * 100) / 100,
        percentage: Math.round(pct * 10) / 10,
      };
    });
  } else {
    // 'tiered': Higher rank pays smaller fraction
    // Assign weight proportional to rank (1st rank weight = 0, 2nd = 1, 3rd = 2... or linear ladder)
    // If n = 1: pays 100%
    if (n === 1) {
      shares = [{ playerId: sorted[0].id, amountOwed: totalBill, percentage: 100 }];
    } else {
      // Escalating weights based on rank - 1 (1st rank gets 0 weight if top, bottom gets highest)
      // Rank 1 => weight 0, Rank N => weight N-1
      const rankWeights = sorted.map((p, i) => ranks[i] - 1);
      const totalWeight = rankWeights.reduce((a, b) => a + b, 0);

      if (totalWeight === 0) {
        // Everyone tied at #1
        const equalShare = totalBill / n;
        shares = sorted.map((p) => ({
          playerId: p.id,
          amountOwed: Math.round(equalShare * 100) / 100,
          percentage: Math.round((100 / n) * 10) / 10,
        }));
      } else {
        shares = sorted.map((p, i) => {
          const pct = (rankWeights[i] / totalWeight) * 100;
          const owed = (pct / 100) * totalBill;
          return {
            playerId: p.id,
            amountOwed: Math.round(owed * 100) / 100,
            percentage: Math.round(pct * 10) / 10,
          };
        });
      }
    }
  }

  // Combine with original order or sorted
  return sorted.map((p, i) => {
    const s = shares.find((item) => item.playerId === p.id) ?? { amountOwed: 0, percentage: 0 };
    return {
      playerId: p.id,
      playerName: p.name,
      score: p.score,
      rank: ranks[i],
      amountOwed: s.amountOwed,
      percentage: s.percentage,
    };
  });
}
