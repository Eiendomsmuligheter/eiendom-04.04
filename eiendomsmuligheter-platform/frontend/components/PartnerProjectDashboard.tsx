import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  Grid, 
  Tabs, 
  Tab, 
  Button, 
  Chip, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Avatar, 
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  People as PeopleIcon,
  Chat as ChatIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Share as ShareIcon
} from '@mui/icons-material';

// Typer
interface Project {
  id: string;
  name: string;
  address: string;
  client: string;
  status: 'planning' | 'in_progress' | 'review' | 'completed';
  progress: number;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  partners: Partner[];
  tasks: Task[];
  documents: Document[];
  messages: Message[];
}

interface Partner {
  id: string;
  name: string;
  role: 'architect' | 'contractor' | 'realtor' | 'engineer' | 'other';
  company: string;
  email: string;
  phone: string;
  avatar?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}

interface Document {
  id: string;
  name: string;
  type: 'blueprint' | 'contract' | 'permit' | 'report' | 'other';
  uploadedBy: string;
  uploadDate: string;
  fileSize: number;
  url: string;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  readBy: string[];
  attachments?: string[];
}

interface PartnerProjectDashboardProps {
  projectId: string;
  partnerId: string;
  className?: string;
}

// Hjelpefunksjoner
const getStatusColor = (status: string) => {
  switch (status) {
    case 'planning':
      return 'info.main';
    case 'in_progress':
      return 'warning.main';
    case 'review':
      return 'secondary.main';
    case 'completed':
      return 'success.main';
    case 'not_started':
      return 'text.secondary';
    case 'blocked':
      return 'error.main';
    default:
      return 'text.primary';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'planning':
      return 'Planlegging';
    case 'in_progress':
      return 'Pågår';
    case 'review':
      return 'Under vurdering';
    case 'completed':
      return 'Fullført';
    case 'not_started':
      return 'Ikke startet';
    case 'blocked':
      return 'Blokkert';
    default:
      return status;
  }
};

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'high':
      return <ErrorIcon color="error" />;
    case 'medium':
      return <WarningIcon color="warning" />;
    case 'low':
      return <CheckCircleIcon color="success" />;
    default:
      return null;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK' }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('nb-NO');
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
};

// Hovedkomponent
const PartnerProjectDashboard: React.FC<PartnerProjectDashboardProps> = ({
  projectId,
  partnerId,
  className
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [taskFilter, setTaskFilter] = useState<string>('all');
  const [documentFilter, setDocumentFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [newMessage, setNewMessage] = useState<string>('');

  // Hent prosjektdata
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        
        // Simuler API-kall for å hente prosjektdata
        // I en faktisk implementasjon ville dette vært et ekte API-kall
        // const response = await fetch(`/api/projects/${projectId}?partnerId=${partnerId}`);
        // if (!response.ok) throw new Error('Kunne ikke hente prosjektdata');
        // const data = await response.json();
        
        // Simuler respons for testing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Testdata
        const mockProject: Project = {
          id: projectId || 'proj-123',
          name: 'Utleiedel Testveien 123',
          address: 'Testveien 123, 0123 Oslo',
          client: 'Ola Nordmann',
          status: 'in_progress',
          progress: 65,
          startDate: '2025-03-15',
          endDate: '2025-06-30',
          budget: 650000,
          spent: 420000,
          partners: [
            {
              id: partnerId || 'partner-1',
              name: 'Arkitekt AS',
              role: 'architect',
              company: 'Arkitekt AS',
              email: 'kontakt@arkitekt.no',
              phone: '12345678'
            },
            {
              id: 'partner-2',
              name: 'Byggmester Hansen',
              role: 'contractor',
              company: 'Hansen Bygg AS',
              email: 'hansen@byggmester.no',
              phone: '87654321'
            },
            {
              id: 'partner-3',
              name: 'Eiendomsmegler Olsen',
              role: 'realtor',
              company: 'Megler1',
              email: 'olsen@megler1.no',
              phone: '23456789'
            }
          ],
          tasks: [
            {
              id: 'task-1',
              title: 'Utarbeide plantegning for utleiedel',
              description: 'Lage detaljert plantegning for utleiedelen med alle nødvendige rom og funksjoner.',
              assignedTo: 'partner-1',
              status: 'completed',
              priority: 'high',
              dueDate: '2025-03-25'
            },
            {
              id: 'task-2',
              title: 'Søke om byggetillatelse',
              description: 'Sende inn søknad om byggetillatelse til kommunen.',
              assignedTo: 'partner-1',
              status: 'completed',
              priority: 'high',
              dueDate: '2025-04-01'
            },
            {
              id: 'task-3',
              title: 'Innhente tilbud fra underleverandører',
              description: 'Innhente tilbud fra rørlegger, elektriker og andre underleverandører.',
              assignedTo: 'partner-2',
              status: 'in_progress',
              priority: 'medium',
              dueDate: '2025-04-15'
            },
            {
              id: 'task-4',
              title: 'Rive eksisterende vegger',
              description: 'Rive vegger i henhold til plantegning for å klargjøre for utleiedel.',
              assignedTo: 'partner-2',
              status: 'in_progress',
              priority: 'medium',
              dueDate: '2025-04-20'
            },
            {
              id: 'task-5',
              title: 'Installere nye vegger og dører',
              description: 'Sette opp nye vegger og dører i henhold til plantegning.',
              assignedTo: 'partner-2',
              status: 'not_started',
              priority: 'medium',
              dueDate: '2025-05-01'
            },
            {
              id: 'task-6',
              title: 'Installere bad og kjøkken',
              description: 'Installere bad og kjøkken i utleiedelen.',
              assignedTo: 'partner-2',
              status: 'not_started',
              priority: 'high',
              dueDate: '2025-05-15'
            },
            {
              id: 'task-7',
              title: 'Markedsføre utleiedel',
              description: 'Lage annonse og markedsføre utleiedelen.',
              assignedTo: 'partner-3',
              status: 'not_started',
              priority: 'low',
              dueDate: '2025-06-01'
            }
          ],
          documents: [
            {
              id: 'doc-1',
              name: 'Original plantegning',
              type: 'blueprint',
              uploadedBy: 'partner-1',
              uploadDate: '2025-03-16',
              fileSize: 2500000,
              url: '/documents/original_blueprint.pdf'
            },
            {
              id: 'doc-2',
              name: 'Modifisert plantegning med utleiedel',
              type: 'blueprint',
              uploadedBy: 'partner-1',
              uploadDate: '2025-03-22',
              fileSize: 2700000,
              url: '/documents/modified_blueprint.pdf'
            },
            {
              id: 'doc-3',
              name: 'Byggesøknad',
              type: 'permit',
              uploadedBy: 'partner-1',
              uploadDate: '2025-03-30',
              fileSize: 1500000,
              url: '/documents/building_permit.pdf'
            },
            {
              id: 'doc-4',
              name: 'Kontrakt med byggmester',
              type: 'contract',
              uploadedBy: 'partner-1',
              uploadDate: '2025-04-05',
              fileSize: 1200000,
              url: '/documents/contractor_contract.pdf'
            },
            {
              id: 'doc-5',
              name: 'Fremdriftsrapport uke 15',
              type: 'report',
              uploadedBy: 'partner-2',
              uploadDate: '2025-04-12',
              fileSize: 800000,
              url: '/documents/progress_report_w15.pdf'
            }
          ],
          messages: [
            {
              id: 'msg-1',
              sender: 'partner-1',
              content: 'Plantegningen for utleiedelen er nå ferdig og lastet opp. Ta gjerne en titt og gi tilbakemelding.',
              timestamp: '2025-03-22T14:30:00',
              readBy: ['partner-2', 'partner-3']
            },
            {
              id: 'msg-2',
              sender: 'partner-2',
              content: 'Plantegningen ser bra ut. Jeg har noen spørsmål angående baderommet. Kan vi ta et møte om dette?',
              timestamp: '2025-03-23T09:15:00',
              readBy: ['partner-1']
            },
            {
              id: 'msg-3',
              sender: 'partner-1',
              content: 'Ja, vi kan ta et møte. Hva med i morgen kl. 10?',
              timestamp: '2025-03-23T10:30:00',
              readBy: ['partner-2']
            },
            {
              id: 'msg-4',
              sender: 'partner-2',
              content: 'Det passer fint. Jeg sender møteinnkalling.',
              timestamp: '2025-03-23T11:45:00',
              readBy: ['partner-1']
            },
            {
              id: 'msg-5',
              sender: 'partner-3',
              content: 'Jeg har sett på plantegningen og tror dette blir veldig attraktivt for utleie. Estimert leieinntekt er 12.000 kr/mnd.',
              timestamp: '2025-03-24T13:20:00',
              readBy: ['partner-1', 'partner-2']
            }
          ]
        };
        
        setProject(mockProject);
        setLoading(false);
      } catch (err) {
        console.error('Feil ved henting av prosjektdata:', err);
        setError('Kunne ikke laste prosjektdata. Vennligst prøv igjen senere.');
        setLoading(false);
      }
    };
    
    fetchProjectData();
  }, [projectId, partnerId]);

  // Håndter tab-endring
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Filtrer oppgaver basert på status
  const getFilteredTasks = () => {
    if (!project) return [];
    
    if (taskFilter === 'all') {
      return project.tasks;
    } else {
      return project.tasks.filter(task => task.status === taskFilter);
    }
  };

  // Filtrer dokumenter basert på type
  const getFilteredDocuments = () => {
    if (!project) return [];
    
    if (documentFilter === 'all') {
      return project.documents;
    } else {
      return project.documents.filter(doc => doc.type === documentFilter);
    }
  };

  // Sorter dokumenter basert på dato
  const getSortedDocuments = () => {
    const filtered = getFilteredDocuments();
    
    return filtered.sort((a, b) => {
      const dateA = new Date(a.uploadDate).getTime();
      const dateB = new Date(b.uploadDate).getTime();
      
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  };

  // Håndter sending av ny melding
  const handleSendMessage = () => {
    if (!newMessage.trim() || !project) return;
    
    const newMsg: Message = {
      id: `msg-${project.messages.length + 1}`,
      sender: partnerId,
      content: newMessage,
      timestamp: new Date().toISOString(),
      readBy: []
    };
    
    setProject({
      ...project,
      messages: [...project.messages, newMsg]
    });
    
    setNewMessage('');
  };

  // Render loading state
  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={4}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Laster prosjektdata...
        </Typography>
      </Box>
    );
  }

  // Render error state
  if (error || !project) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={4}>
        <Typography variant="h6" color="error">
          {error || 'Kunne ikke laste prosjektdata'}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Prøv igjen
        </Button>
      </Box>
    );
  }

  return (
    <Box className={className}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4">{project.name}</Typography>
            <Typography variant="subtitle1" color="text.secondary">{project.address}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Chip 
                label={getStatusText(project.status)} 
                color={project.status === 'completed' ? 'success' : 'primary'} 
                size="small" 
                sx={{ mr: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Fremdrift: {project.progress}%
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
              <Typography variant="body2" color="text.secondary">
                Prosjektperiode: {formatDate(project.startDate)} - {formatDate(project.endDate)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Budsjett: {formatCurrency(project.budget)}
              </Typography>
              <Typography variant="body2" color={project.spent > project.budget ? 'error.main' : 'text.secondary'}>
                Brukt: {formatCurrency(project.spent)} ({Math.round(project.spent / project.budget * 100)}%)
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="project tabs">
            <Tab label="Oversikt" icon={<AssignmentIcon />} iconPosition="start" />
            <Tab label="Oppgaver" icon={<ScheduleIcon />} iconPosition="start" />
            <Tab label="Dokumenter" icon={<DescriptionIcon />} iconPosition="start" />
            <Tab label="Partnere" icon={<PeopleIcon />} iconPosition="start" />
            <Tab label="Kommunikasjon" icon={<ChatIcon />} iconPosition="start" />
          </Tabs>
        </Box>
        
        {/* Oversikt */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Prosjektfremdrift
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Total fremdrift: {project.progress}%
                  </Typography>
                  <Box sx={{ width: '100%', bgcolor: 'background.default', borderRadius: 1, height: 10, overflow: 'hidden' }}>
                    <Box
                      sx={{
                        width: `${project.progress}%`,
                        bgcolor: 'primary.main',
                        height: '100%',
                      }}
                    />
                  </Box>
                </Box>
                
                <Typography variant="subtitle2" gutterBottom>
                  Oppgavestatus
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Chip 
                    label={`Fullført: ${project.tasks.filter(t => t.status === 'completed').length}`} 
                    color="success" 
                    size="small" 
                    variant="outlined"
                  />
                  <Chip 
                    label={`Pågår: ${project.tasks.filter(t => t.status === 'in_progress').length}`} 
                    color="warning" 
                    size="small" 
                    variant="outlined"
                  />
                  <Chip 
                    label={`Ikke startet: ${project.tasks.filter(t => t.status === 'not_started').length}`} 
                    color="default" 
                    size="small" 
                    variant="outlined"
                  />
                  <Chip 
                    label={`Blokkert: ${project.tasks.filter(t => t.status === 'blocked').length}`} 
                    color="error" 
                    size="small" 
                    variant="outlined"
                  />
                </Box>
                
                <Typography variant="subtitle2" gutterBottom>
                  Neste milepæler
                </Typography>
                <List dense>
                  {project.tasks
                    .filter(task => task.status !== 'completed')
                    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                    .slice(0, 3)
                    .map(task => (
                      <ListItem key={task.id}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {getPriorityIcon(task.priority)}
                        </ListItemIcon>
                        <ListItemText 
                          primary={task.title} 
                          secondary={`Frist: ${formatDate(task.dueDate)}`} 
                        />
                      </ListItem>
                    ))
                  }
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Økonomisk oversikt
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Totalt budsjett</Typography>
                      <Typography variant="h6">{formatCurrency(project.budget)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Brukt hittil</Typography>
                      <Typography variant="h6" color={project.spent > project.budget ? 'error.main' : 'inherit'}>
                        {formatCurrency(project.spent)}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 2, width: '100%', bgcolor: 'background.default', borderRadius: 1, height: 10, overflow: 'hidden' }}>
                    <Box
                      sx={{
                        width: `${Math.min(project.spent / project.budget * 100, 100)}%`,
                        bgcolor: project.spent > project.budget ? 'error.main' : 'success.main',
                        height: '100%',
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" align="right" sx={{ mt: 0.5 }}>
                    {Math.round(project.spent / project.budget * 100)}% av budsjett
                  </Typography>
                </Box>
                
                <Typography variant="subtitle2" gutterBottom>
                  Kostnadsfordeling
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Kategori</TableCell>
                        <TableCell align="right">Budsjett</TableCell>
                        <TableCell align="right">Brukt</TableCell>
                        <TableCell align="right">Gjenstår</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Materialer</TableCell>
                        <TableCell align="right">{formatCurrency(250000)}</TableCell>
                        <TableCell align="right">{formatCurrency(180000)}</TableCell>
                        <TableCell align="right">{formatCurrency(70000)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Arbeidskraft</TableCell>
                        <TableCell align="right">{formatCurrency(350000)}</TableCell>
                        <TableCell align="right">{formatCurrency(220000)}</TableCell>
                        <TableCell align="right">{formatCurrency(130000)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Tillatelser</TableCell>
                        <TableCell align="right">{formatCurrency(20000)}</TableCell>
                        <TableCell align="right">{formatCurrency(15000)}</TableCell>
                        <TableCell align="right">{formatCurrency(5000)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Annet</TableCell>
                        <TableCell align="right">{formatCurrency(30000)}</TableCell>
                        <TableCell align="right">{formatCurrency(5000)}</TableCell>
                        <TableCell align="right">{formatCurrency(25000)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Siste aktivitet
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <DescriptionIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Fremdriftsrapport uke 15 lastet opp" 
                      secondary={`Av: ${project.partners.find(p => p.id === 'partner-2')?.name} - ${formatDate(project.documents[4].uploadDate)}`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Oppgave fullført: Søke om byggetillatelse" 
                      secondary={`Av: ${project.partners.find(p => p.id === 'partner-1')?.name} - ${formatDate('2025-04-01')}`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <MoneyIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Faktura betalt: Materialer" 
                      secondary={`Beløp: ${formatCurrency(120000)} - ${formatDate('2025-03-28')}`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <ChatIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Ny melding fra Eiendomsmegler Olsen" 
                      secondary={`"Jeg har sett på plantegningen og tror dette blir veldig attraktivt for utleie..." - ${formatDate('2025-03-24')}`} 
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Oppgaver */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="task-filter-label">Filter</InputLabel>
              <Select
                labelId="task-filter-label"
                value={taskFilter}
                onChange={(e) => setTaskFilter(e.target.value)}
                label="Filter"
              >
                <MenuItem value="all">Alle oppgaver</MenuItem>
                <MenuItem value="not_started">Ikke startet</MenuItem>
                <MenuItem value="in_progress">Pågår</MenuItem>
                <MenuItem value="completed">Fullført</MenuItem>
                <MenuItem value="blocked">Blokkert</MenuItem>
              </Select>
            </FormControl>
            
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              size="small"
            >
              Ny oppgave
            </Button>
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Oppgave</TableCell>
                  <TableCell>Prioritet</TableCell>
                  <TableCell>Tildelt</TableCell>
                  <TableCell>Frist</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Handlinger</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredTasks().map((task) => {
                  const assignedPartner = project.partners.find(p => p.id === task.assignedTo);
                  
                  return (
                    <TableRow key={task.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">{task.title}</Typography>
                        <Typography variant="body2" color="text.secondary">{task.description}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getPriorityIcon(task.priority)}
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {task.priority === 'high' ? 'Høy' : task.priority === 'medium' ? 'Medium' : 'Lav'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{assignedPartner?.name || 'Ikke tildelt'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatDate(task.dueDate)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusText(task.status)} 
                          size="small"
                          sx={{ 
                            bgcolor: getStatusColor(task.status),
                            color: task.status === 'not_started' ? 'text.primary' : 'white'
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        {/* Dokumenter */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="document-filter-label">Filter</InputLabel>
                <Select
                  labelId="document-filter-label"
                  value={documentFilter}
                  onChange={(e) => setDocumentFilter(e.target.value)}
                  label="Filter"
                >
                  <MenuItem value="all">Alle dokumenter</MenuItem>
                  <MenuItem value="blueprint">Plantegninger</MenuItem>
                  <MenuItem value="contract">Kontrakter</MenuItem>
                  <MenuItem value="permit">Tillatelser</MenuItem>
                  <MenuItem value="report">Rapporter</MenuItem>
                  <MenuItem value="other">Andre</MenuItem>
                </Select>
              </FormControl>
              
              <Button 
                variant="outlined" 
                startIcon={sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                size="small"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? 'Eldste først' : 'Nyeste først'}
              </Button>
            </Box>
            
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              size="small"
            >
              Last opp dokument
            </Button>
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Dokument</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Lastet opp av</TableCell>
                  <TableCell>Dato</TableCell>
                  <TableCell>Størrelse</TableCell>
                  <TableCell align="right">Handlinger</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getSortedDocuments().map((doc) => {
                  const uploadedByPartner = project.partners.find(p => p.id === doc.uploadedBy);
                  
                  return (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">{doc.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={
                            doc.type === 'blueprint' ? 'Plantegning' : 
                            doc.type === 'contract' ? 'Kontrakt' : 
                            doc.type === 'permit' ? 'Tillatelse' : 
                            doc.type === 'report' ? 'Rapport' : 'Annet'
                          } 
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{uploadedByPartner?.name || 'Ukjent'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatDate(doc.uploadDate)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatFileSize(doc.fileSize)}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" sx={{ mr: 1 }}>
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small">
                          <ShareIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        {/* Partnere */}
        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            {project.partners.map((partner) => (
              <Grid item xs={12} sm={6} md={4} key={partner.id}>
                <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {partner.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{partner.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{partner.company}</Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="body2" gutterBottom>
                    <strong>Rolle:</strong> {
                      partner.role === 'architect' ? 'Arkitekt' : 
                      partner.role === 'contractor' ? 'Entreprenør' : 
                      partner.role === 'realtor' ? 'Eiendomsmegler' : 
                      partner.role === 'engineer' ? 'Ingeniør' : 'Annet'
                    }
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    <strong>E-post:</strong> {partner.email}
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    <strong>Telefon:</strong> {partner.phone}
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Oppgaver:</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        size="small" 
                        label={`${project.tasks.filter(t => t.assignedTo === partner.id).length} totalt`} 
                        color="primary" 
                        variant="outlined" 
                      />
                      <Chip 
                        size="small" 
                        label={`${project.tasks.filter(t => t.assignedTo === partner.id && t.status === 'completed').length} fullført`} 
                        color="success" 
                        variant="outlined" 
                      />
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button size="small" variant="outlined">
                      Send melding
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
        
        {/* Kommunikasjon */}
        <TabPanel value={activeTab} index={4}>
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Box sx={{ height: 400, overflowY: 'auto', mb: 2 }}>
              {project.messages.map((message) => {
                const sender = project.partners.find(p => p.id === message.sender);
                const isCurrentPartner = message.sender === partnerId;
                
                return (
                  <Box 
                    key={message.id} 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: isCurrentPartner ? 'row-reverse' : 'row',
                      mb: 2 
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: isCurrentPartner ? 'primary.main' : 'grey.400',
                        ml: isCurrentPartner ? 1 : 0,
                        mr: isCurrentPartner ? 0 : 1
                      }}
                    >
                      {sender?.name.charAt(0) || '?'}
                    </Avatar>
                    <Box 
                      sx={{ 
                        maxWidth: '70%',
                        bgcolor: isCurrentPartner ? 'primary.light' : 'grey.100',
                        color: isCurrentPartner ? 'white' : 'inherit',
                        borderRadius: 2,
                        p: 2
                      }}
                    >
                      <Typography variant="subtitle2">
                        {sender?.name || 'Ukjent'} 
                        <Typography 
                          component="span" 
                          variant="caption" 
                          sx={{ 
                            ml: 1,
                            color: isCurrentPartner ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                          }}
                        >
                          {new Date(message.timestamp).toLocaleTimeString('nb-NO', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit'
                          })}
                        </Typography>
                      </Typography>
                      <Typography variant="body2">
                        {message.content}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Skriv en melding..."
                size="small"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                variant="contained" 
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                Send
              </Button>
            </Box>
          </Paper>
        </TabPanel>
      </Box>
    </Box>
  );
};

// TabPanel komponent
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default PartnerProjectDashboard;
