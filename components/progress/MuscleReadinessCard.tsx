import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BatteryCharging, Zap } from 'lucide-react-native';
import { MuscleReadiness } from './useProgressCommandCenter';

interface MuscleReadinessCardProps {
  readinessList: MuscleReadiness[];
  summary: {
    title: string;
    subtitle: string;
    isRestRecommended: boolean;
  };
}

export const MuscleReadinessCard: React.FC<MuscleReadinessCardProps> = ({
  readinessList,
  summary,
}) => {
  return (
    <View style={styles.card}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: summary.isRestRecommended ? '#EF444415' : '#10B98115' }]}>
          {summary.isRestRecommended ? (
            <BatteryCharging size={16} color="#EF4444" strokeWidth={2.5} />
          ) : (
            <Zap size={16} color="#10B981" strokeWidth={2.5} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>MUSCLE RECOVERY BATTERY</Text>
          <Text style={styles.headerSubtitle} numberOfLines={2}>
            {summary.subtitle}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Muscle List with Colored Progress Bars & Percentage Badges */}
      <View style={styles.list}>
        {readinessList.map((item) => {
          const badgeBg = item.badgeBg || '#10B98115';
          const badgeText = item.badgeText || '#059669';
          const statusText =
            item.percentage >= 100
              ? '100% RELOADED'
              : `${item.percentage}% ${(item.statusLabel || item.status).toUpperCase()}`;

          return (
            <View key={item.muscle} style={styles.row}>
              <View style={styles.rowTop}>
                <View style={styles.nameCol}>
                  <View style={[styles.dot, { backgroundColor: item.color }]} />
                  <Text style={styles.muscleName} numberOfLines={1} ellipsizeMode="tail">
                    {item.muscle}
                  </Text>
                  <Text style={styles.timeText} numberOfLines={1} ellipsizeMode="tail">
                    · {item.lastTrainedLabel}
                  </Text>
                </View>

                {/* Colored Percentage Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
                  <Text style={[styles.statusBadgeText, { color: badgeText }]} numberOfLines={1}>
                    {statusText}
                  </Text>
                </View>
              </View>

              {/* Sleek Colored Battery Progress Bar */}
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
    overflow: 'hidden',
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
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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
    lineHeight: 15,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#F3F4F6',
    marginVertical: 14,
  },
  list: {
    gap: 14,
  },
  row: {
    gap: 6,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  nameCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    flexShrink: 1,
    marginRight: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    flexShrink: 0,
  },
  muscleName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    flexShrink: 1,
  },
  timeText: {
    fontSize: 10.5,
    color: '#9CA3AF',
    fontWeight: '500',
    flexShrink: 0,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    alignItems: 'center',
    flexShrink: 0,
  },
  statusBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  track: {
    height: 5,
    backgroundColor: '#F3F4F6',
    borderRadius: 99,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 99,
  },
});
