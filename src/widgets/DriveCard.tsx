import React, { useEffect, useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardActions, Button, Typography, Stack, Chip } from '@mui/material';
import { collection as fsCollection, getDocs } from 'firebase/firestore';

export default function DriveCard({ drive }: any) {
  const { user } = useAuth();
  const [resources, setResources] = useState<Array<{ name: string; url: string }>>([]);
  useEffect(() => {
    (async () => {
      try {
        const resCol = fsCollection(db, `drives/${drive.id}/resources`);
        const snaps = await getDocs(resCol);
        setResources(snaps.docs.map(d => ({ name: d.data().name as string, url: d.data().url as string })));
      } catch {
        setResources([]);
      }
    })();
  }, [drive?.id]);
  const apply = async () => {
    if (!user) return alert('Login first');
    await addDoc(collection(db, 'registrations'), {
      driveId: drive.id,
      studentId: user.uid,
      status: 'applied',
      appliedAt: new Date().toISOString(),
    });
    alert('Applied');
  };

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          {drive.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {drive.description}
        </Typography>
        <Stack spacing={0.5}>
          <Typography variant="body2"><strong>Date:</strong> {drive.date}</Typography>
          <Typography variant="body2"><strong>Eligibility:</strong> {drive.eligibility}</Typography>
        </Stack>
        {resources.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
            {resources.slice(0, 3).map((r, i) => (
              <Chip key={`${r.name}-${i}`} label={r.name} component="a" href={r.url} target="_blank" clickable size="small" />
            ))}
            {resources.length > 3 && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                +{resources.length - 3} more
              </Typography>
            )}
          </Stack>
        )}
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button variant="contained" fullWidth onClick={apply}>Apply</Button>
      </CardActions>
    </Card>
  );
}