import React from 'react';
import { db } from '../firebase/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Paper, Stack, Typography, Button, Box, LinearProgress } from '@mui/material';

export default function ResumeUpload() {
	const { user } = useAuth();
	const [file, setFile] = React.useState<File | null>(null);
	const [uploading, setUploading] = React.useState(false);
	const [fileName, setFileName] = React.useState('');

	const upload = async () => {
		if (!user || !file) return alert('Choose a file');
		try {
			setUploading(true);
			
			// Convert file to base64 for storage in Firestore
			const reader = new FileReader();
			reader.onload = async (e) => {
				try {
					const base64String = e.target?.result as string;
					await updateDoc(doc(db, 'users', user.uid), { 
						resumeData: base64String, 
						resumeName: file.name,
						resumeUploaded: true,
						resumeType: file.type,
						resumeSize: file.size
					});
					alert('Resume uploaded successfully!');
					setFile(null);
					setFileName('');
				} catch (error) {
					console.error('Error saving resume:', error);
					alert('Failed to upload resume. Please try again.');
				} finally {
					setUploading(false);
				}
			};
			
			reader.onerror = () => {
				setUploading(false);
				alert('Failed to read file. Please try again.');
			};
			
			reader.readAsDataURL(file);
		} catch (error) {
			console.error('Error uploading resume:', error);
			alert('Failed to upload resume. Please try again.');
			setUploading(false);
		}
	};

	return (
		<Paper variant="outlined" sx={{ p: 2 }}>
			<Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Upload Resume</Typography>
			<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
				<Button variant="outlined" component="label" sx={{ flexShrink: 0 }} disabled={uploading}>
					Choose File
					<input
						type="file"
						accept="application/pdf,.doc,.docx"
						hidden
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							const selected = e.target.files?.[0] || null;
							setFile(selected);
							setFileName(selected ? selected.name : '');
						}}
					/>
				</Button>
				<Box sx={{ flex: 1 }}>
					<Typography variant="body2" color="text.secondary" noWrap>
						{fileName || 'No file chosen'}
					</Typography>
				</Box>
				<Button variant="contained" onClick={upload} disabled={!file || uploading}>
					{uploading ? 'Uploading...' : 'Upload'}
				</Button>
			</Stack>
			{uploading && (
				<Box sx={{ mt: 2 }}>
					<LinearProgress />
				</Box>
			)}
		</Paper>
	);
}