export default function ActivitiesPage() {
  return (
    <>
      <h1>Activities</h1>
      <p>Imagine all the activities!</p>
    </>
  );
}

import React, { useContext, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { AuthContext } from '../contexts/AuthContext';
import { fetchActivities, addActivity, deleteActivity } from '../api';

const ActivitiesPage = () => {
  const { token } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const { data: activities, isLoading, error } = useQuery('activities', fetchActivities);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [addError, setAddError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const addMutation = useMutation(
    (newActivity) => addActivity({ ...newActivity, token }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('activities');
        setFormData({ name: '', description: '' });
        setAddError('');
      },
      onError: (err) => {
        setAddError(err.response?.data?.error || 'Failed to add activity.');
      },
    }
  );

  const deleteMutation = useMutation(
    (id) => deleteActivity({ id, token }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('activities');
        setDeleteError('');
      },
      onError: (err) => {
        setDeleteError(err.response?.data?.error || 'Failed to delete activity.');
      },
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description) return;
    addMutation.mutate(formData);
  };

  return (
    <div>
      <h1>Activities</h1>

      {isLoading ? (
        <p>Loading activities...</p>
      ) : error ? (
        <p>Error loading activities.</p>
      ) : (
        <ul>
          {activities.map((activity) => (
            <li key={activity.id}>
              <strong>{activity.name}</strong>: {activity.description}
              {token && (
                <button
                  onClick={() => deleteMutation.mutate(activity.id)}
                  style={{ marginLeft: '1em' }}
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {deleteError && <p style={{ color: 'red' }}>{deleteError}</p>}

      {token && (
        <form onSubmit={handleSubmit} style={{ marginTop: '2em' }}>
          <h2>Add New Activity</h2>
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <br />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <br />
          <button type="submit">Add Activity</button>
          {addError && <p style={{ color: 'red' }}>{addError}</p>}
        </form>
      )}
    </div>
  );
};

export default ActivitiesPage;
