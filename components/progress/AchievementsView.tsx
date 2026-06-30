import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Achievement } from '../../hooks/use-workout-analytics';
import { Award, Trophy, Flame, Zap } from 'lucide-react-native';

interface AchievementsViewProps {
  achievements: Achievement[];
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ achievements }) => {
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

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>ACHIEVEMENTS</Text>
      
      {achievements.map((ach) => (
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
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
  achCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    marginTop: 12,
    paddingLeft: 44, // Align with description text (width of iconCol + gap)
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
});
