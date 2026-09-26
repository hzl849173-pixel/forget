import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame, Trophy, TrendingUp } from 'lucide-react-native';
import { PostWorkoutValidation } from './usePostWorkoutValidation';

interface PostWorkoutValidationCardProps {
  validation: PostWorkoutValidation;
}

export const PostWorkoutValidationCard: React.FC<PostWorkoutValidationCardProps> = ({
  validation,
}) => {
  if (!validation.hasHistory) {
    return (
      <View style={styles.card}>
        <View style={styles.welcomeIconWrap}>
          <Flame size={20} color="#10B981" strokeWidth={2.2} />
        </View>
        <Text style={styles.welcomeTitle}>Post-Workout Command Center</Text>
        <Text style={styles.welcomeDesc}>
          After your workout, this window validates your progressive overload and highlights your strength progression.
        </Text>
      </View>
    );
  }

  const {
    latestSessionName,
    latestSessionDateFormatted,
    headline,
    badgeLabel,
    badgeColor,
    standoutLift,
    overloadCount,
    totalSetsInSession,
    totalVolumeInSession,
  } = validation;

  return (
    <View style={styles.card}>
      {/* Header Tag & Session Date */}
      <View style={styles.headerRow}>
        <View style={[styles.badgePill, { backgroundColor: `${badgeColor}15`, borderColor: `${badgeColor}40` }]}>
          <Flame size={11} color={badgeColor} strokeWidth={2.5} />
          <Text style={[styles.badgeText, { color: badgeColor }]}>{badgeLabel}</Text>
        </View>
        <Text style={styles.sessionDateText}>{latestSessionDateFormatted}</Text>
      </View>

      {/* Main Headline & Session Name */}
      <Text style={styles.headlineText}>{headline}</Text>
      <Text style={styles.sessionNameSub}>{latestSessionName}</Text>

      {/* Standout Lift Hero Highlight */}
      {standoutLift && (
        <View style={styles.standoutBox}>
          <View style={styles.standoutLeft}>
            <View style={styles.standoutIcon}>
              {standoutLift.isNewPr ? (
                <Trophy size={15} color="#F59E0B" strokeWidth={2.5} />
              ) : (
                <TrendingUp size={15} color="#10B981" strokeWidth={2.5} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.standoutLabel}>
                {standoutLift.isNewPr ? 'PR HIGHLIGHT' : 'STANDOUT LIFT'}
              </Text>
              <Text style={styles.standoutName} numberOfLines={1}>
                {standoutLift.exerciseName}
              </Text>
            </View>
          </View>

          <View style={styles.standoutRight}>
            <Text style={styles.standoutWeight}>
              {standoutLift.weight} kg <Text style={{ fontSize: 11, fontWeight: '600', color: '#6B7280' }}>× {standoutLift.reps}</Text>
            </Text>
            <Text style={[styles.standoutDiff, { color: standoutLift.isNewPr ? '#F59E0B' : '#10B981' }]}>
              {standoutLift.overloadText}
            </Text>
          </View>
        </View>
      )}

      {/* 3 Clean Whitespace Metric Columns */}
      <View style={styles.scoreRow}>
        <View style={styles.scoreCol}>
          <Text style={styles.scoreNum}>{overloadCount}</Text>
          <Text style={styles.scoreLbl}>PROGRESSIONS</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreCol}>
          <Text style={styles.scoreNum}>{totalSetsInSession}</Text>
          <Text style={styles.scoreLbl}>HARD SETS</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreCol}>
          <Text style={styles.scoreNum}>
            {totalVolumeInSession >= 1000
              ? `${(totalVolumeInSession / 1000).toFixed(1)}k`
              : totalVolumeInSession}
          </Text>
          <Text style={styles.scoreLbl}>KG LIFTED</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  sessionDateText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  headlineText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.3,
  },
  sessionNameSub: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#10B981',
    marginTop: 2,
    marginBottom: 14,
  },
  standoutBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
  },
  standoutLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 10,
  },
  standoutIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  standoutLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  standoutName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginTop: 1,
  },
  standoutRight: {
    alignItems: 'flex-end',
  },
  standoutWeight: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111827',
  },
  standoutDiff: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 10,
  },
  scoreCol: {
    alignItems: 'center',
    flex: 1,
  },
  scoreNum: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111827',
  },
  scoreLbl: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#9CA3AF',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  scoreDivider: {
    width: StyleSheet.hairlineWidth,
    height: 20,
    backgroundColor: '#E5E7EB',
  },
  welcomeIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#10B98115',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  welcomeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  welcomeDesc: {
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 16,
  },
});
