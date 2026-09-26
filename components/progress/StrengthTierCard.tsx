import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Shield } from 'lucide-react-native';
import { StrengthTier } from './useProgressCommandCenter';

interface StrengthTierCardProps {
  tiers: StrengthTier[];
}

export const StrengthTierCard: React.FC<StrengthTierCardProps> = ({ tiers }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Shield size={16} color="#8B5CF6" strokeWidth={2.5} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>STRENGTH TIERS</Text>
          <Text style={styles.headerSubtitle}>Estimated 1RM power rating</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.list}>
        {tiers.map((tier) => (
          <View key={tier.category} style={styles.item}>
            <View style={styles.itemTop}>
              <View style={styles.infoCol}>
                <Text style={styles.categoryName}>{tier.category.toUpperCase()}</Text>
                <Text style={styles.keyLift} numberOfLines={1} ellipsizeMode="tail">
                  {tier.keyLiftName} · <Text style={{ fontWeight: '800', color: '#111827' }}>{tier.score} kg e1RM</Text>
                </Text>
              </View>

              <View style={[styles.tierTag, { backgroundColor: `${tier.color}15` }]}>
                <Text style={[styles.tierTagText, { color: tier.color }]}>{tier.tierName}</Text>
              </View>
            </View>

            <View style={styles.trackRow}>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${tier.nextTierProgress}%`,
                      backgroundColor: tier.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{tier.nextTierProgress}%</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#8B5CF615',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.6,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  list: {
    gap: 10,
  },
  item: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 11,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  infoCol: {
    flex: 1,
    marginRight: 6,
  },
  categoryName: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.6,
  },
  keyLift: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 1,
  },
  tierTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignItems: 'center',
  },
  tierTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  track: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
  },
});
