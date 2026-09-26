import React, { useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '../store/authSlice';
import {
  fetchMyApplications,
  selectApplications,
  selectApplicationsLoading,
  selectApplicationsError,
} from '../store/applicationsSlice';
import { Button } from './ui/button';
import { Card, CardContent, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';

import { ApplicationsPageSkeleton } from './Skeletons';

// Memoized application card to prevent unnecessary re-renders
const ApplicationCard = React.memo(({ app, onViewDetails }) => {
  const statusVariant = useMemo(() => {
    switch (app.status) {
      case 'Accepted': return 'success';
      case 'Rejected': return 'destructive';
      default: return 'warning';
    }
  }, [app.status]);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1">
          <CardTitle className="text-xl mb-1">
            {app.university?.courseName || "Unknown Course"}
          </CardTitle>
          <CardDescription className="font-bold text-base">
            {app.university?.institutionId?.name || app.university?.name || "Unknown University"}
          </CardDescription>
          <p className="text-sm text-deep-green/50 mt-2">
            Applied on: {new Date(app.createdAt).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant={statusVariant}>
            {app.status}
          </Badge>
          <Button variant="link" size="sm" onClick={() => onViewDetails(app._id)}>
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

ApplicationCard.displayName = 'ApplicationCard';

const MyApplications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux selectors
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const applications = useSelector(selectApplications);
  const loading = useSelector(selectApplicationsLoading);
  const error = useSelector(selectApplicationsError);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(fetchMyApplications());
  }, [isAuthenticated, dispatch, navigate]);

  // Memoize filtered results for each status
  const filteredByStatus = useMemo(() => ({
    all: applications,
    Pending: applications.filter(a => a.status === 'Pending'),
    Accepted: applications.filter(a => a.status === 'Accepted'),
    Rejected: applications.filter(a => a.status === 'Rejected'),
  }), [applications]);

  // Memoize status counts
  const statusCounts = useMemo(() => ({
    all: applications.length,
    Pending: filteredByStatus.Pending.length,
    Accepted: filteredByStatus.Accepted.length,
    Rejected: filteredByStatus.Rejected.length,
  }), [applications.length, filteredByStatus]);

  // Stable callback for view details
  const handleViewDetails = useCallback((appId) => {
    // Future: navigate to details page
    console.log('View details for:', appId);
  }, []);

  // Stable callback for browse
  const handleBrowse = useCallback(() => {
    navigate('/colleges');
  }, [navigate]);

  if (loading) return <ApplicationsPageSkeleton />;

  if (error) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-6">
          <p className="text-red-500 font-bold">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => dispatch(fetchMyApplications())}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const EmptyState = ({ message }) => (
    <Card className="text-center">
      <CardContent className="py-12">
        <div className="w-16 h-16 bg-light-green/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-3xl text-deep-green/40">description</span>
        </div>
        <p className="text-deep-green/70 mb-4">{message}</p>
        <Button onClick={handleBrowse}>
          Browse Programs
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-off-white font-display p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-extrabold text-deep-green">My Applications</h1>
          <Button variant="outline" size="sm" onClick={handleBrowse}>
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Application
          </Button>
        </div>

        {applications.length === 0 ? (
          <EmptyState message="You haven't applied to any programs yet." />
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="all">
                All <span className="ml-1.5 text-xs bg-deep-green/10 px-2 py-0.5 rounded-full">{statusCounts.all}</span>
              </TabsTrigger>
              <TabsTrigger value="Pending">
                Pending <span className="ml-1.5 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">{statusCounts.Pending}</span>
              </TabsTrigger>
              <TabsTrigger value="Accepted">
                Accepted <span className="ml-1.5 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">{statusCounts.Accepted}</span>
              </TabsTrigger>
              <TabsTrigger value="Rejected">
                Rejected <span className="ml-1.5 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">{statusCounts.Rejected}</span>
              </TabsTrigger>
            </TabsList>

            {['all', 'Pending', 'Accepted', 'Rejected'].map(status => (
              <TabsContent key={status} value={status}>
                <div className="grid grid-cols-1 gap-4">
                  {filteredByStatus[status].length === 0 ? (
                    <EmptyState message={`No ${status.toLowerCase()} applications found.`} />
                  ) : (
                    filteredByStatus[status].map((app) => (
                      <ApplicationCard
                        key={app._id}
                        app={app}
                        onViewDetails={handleViewDetails}
                      />
                    ))
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
