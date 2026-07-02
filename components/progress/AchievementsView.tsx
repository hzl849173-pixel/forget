import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Achievement } from '../../hooks/use-workout-analytics';
import { Award, Trophy, Flame, Zap, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react-native';

interface AchievementsViewProps {
  achievements: Achievement[];
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ achievements }) => {
  const [showAll, setShowAll] = useState(false);

  const getCategoryIcon = (id: string, isUnlocked: boolean) => {
    const size = 18;
    const strokeWidth = 2.5;
    
    if (id.startsWith('st-')) {
      const color = isUnlocked ? '#D97706' : '#9CA3AF';
      return <Flame size={size} color={color} strokeWidth={strokeWidth} fill={isUnlocked ? '#F59E0B20' : 'transparent'} />;
    }
    if (id.startsWith('pr-')) {
      const color = isUnlocked ? '#EAB308' : '#9CA3AF';
      return <Trophy size={size} color={color} strokeWidth={strokeWidth} fill={isUnlocked ? '#FACC1520' : 'transparent'} />;
    }
    if (id.startsWith('vol-')) {
      const color = isUnlocked ? '#8B5CF6' : '#9CA3AF';
      return <Zap size={size} color={color} strokeWidth={strokeWidth} fill={isUnlocked ? '#8B5CF620' : 'transparent'} />;
    }
    // Default workouts
    const color = isUnlocked ? '#10B981' : '#9CA3AF';
    return <Award size={size} color={color} strokeWidth={strokeWidth} fill={isUnlocked ? '#10B98120' : 'transparent'} />;
  };

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;
  const unlockedPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  // Sort locked achievements by progress closest to completion
  const lockedAchievements = achievements.filter((a) => !a.isUnlocked).sort((a, b) => b.progress - a.progress);
  
  let visibleAchievements: Achievement[] = [];
  if (showAll) {
    visibleAchievements = [...achievements].sort((a, b) => (b.isUnlocked ? 1 : 0) - (a.isUnlocked ? 1 : 0));
  } else {
    visibleAchievements = lockedAchievements.slice(0, 3);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>ACHIEVEMENTS</Text>
      
      {/* Summary progress overview card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryInfo}>
          <Text style={styles.summaryCount}>{unlockedCount} of {totalCount} Unlocked</Text>
          <Text style={styles.summaryPercent}>{unlockedPercent}%</Text>
        </View>
        <View style={styles.summaryTrack}>
          <View style={[styles.summaryBar, { width: `${unlockedPercent}%` }]} />
        </View>
      </View>

      {!showAll && lockedAchievements.length > 0 && (
        <Text style={styles.subHeader}>NEXT MILESTONES TO REACH</Text>
      )}

      {visibleAchievements.length === 0 && !showAll && (
        <View style={styles.emptyCard}>
          <CheckCircle size={22} color="#10B981" />
          <Text style={styles.allUnlockedText}>All milestones unlocked! Great job!</Text>
        </View>
      )}

      {visibleAchievements.map((ach) => (
        <View
          key={ach.id}
          style={[
            styles.achCard,
            {
              backgroundColor: ach.isUnlocked ? '#10B98106' : '#FFFFFF',
              borderColor: ach.isUnlocked ? '#10B98125' : '#E5E7EB',
            }
          ]}
        >
          <View style={styles.header}>
            <View style={styles.iconCol}>
              {getCategoryIcon(ach.id, ach.isUnlocked)}
            </View>
            
            <View style={styles.leftCol}>
              <Text style={[styles.title, { color: ach.isUnlocked ? '#065F46' : '#111827' }]}>
                {ach.title}
              </Text>
              <Text style={[styles.desc, { color: ach.isUnlocked ? '#047857' : '#6B7280' }]}>
                {ach.description}
              </Text>
            </View>

            <View style={styles.rightCol}>
              {ach.isUnlocked ? (
                <View style={styles.unlockedBadge}>
                  <Text style={styles.unlockedBadgeText}>UNLOCKED</Text>
                </View>
              ) : (
                <Text style={styles.targetLabel}>{ach.targetLabel}</Text>
              )}
            </View>
          </View>

          {!ach.isUnlocked && (
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressBar, { width: `${ach.progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{ach.progress}%</Text>
            </View>
          )}
        </View>
      ))}

      {achievements.length > 3 && (
        <TouchableOpacity
          style={styles.toggleBtn}
          onPress={() => setShowAll(!showAll)}
          activeOpacity={0.7}
        >
          <Text style={styles.toggleBtnText}>
            {showAll ? 'Show Less' : `Show All Milestones (${achievements.length})`}
          </Text>
          {showAll ? (
            <ChevronUp size={14} color="#3B82F6" strokeWidth={2.5} />
          ) : (
            <ChevronDown size={14} color="#3B82F6" strokeWidth={2.5} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  summaryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryCount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  summaryPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
  },
  summaryTrack: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  summaryBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  subHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  allUnlockedText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '700',
    textAlign: 'center',
  },
  achCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconCol: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftCol: {
    flex: 1,
  },
  rightCol: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  desc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
    fontWeight: '500',
  },
  unlockedBadge: {
    backgroundColor: '#10B98115',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  unlockedBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },
  targetLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '700',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingLeft: 48,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '700',
    marginLeft: 10,
    width: 28,
    textAlign: 'right',
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginTop: 4,
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3B82F6',
  },
});
