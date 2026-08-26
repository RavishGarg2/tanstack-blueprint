import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient, QueryKey } from '@tanstack/react-query';

export function useRefreshOnFocus(queryKey?: QueryKey) {
  const queryClient = useQueryClient();
  const firstTimeRef = React.useRef(true);
  const queryKeyRef = React.useRef(queryKey);
  queryKeyRef.current = queryKey;

  useFocusEffect(
    React.useCallback(() => {
      if (firstTimeRef.current) {
        firstTimeRef.current = false;
        return;
      }

      queryClient.refetchQueries({
        queryKey: queryKeyRef.current,
        stale: true,
        type: 'active',
      });
    }, [queryClient]),
  );
}
