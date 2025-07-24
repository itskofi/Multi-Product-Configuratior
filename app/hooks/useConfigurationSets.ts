import { useState, useCallback, useEffect } from 'react';
import { ConfigurationSet, ConfiguredProduct, ConfiguratorState } from '../types';

export function useConfigurationSets() {
  const [state, setState] = useState<ConfiguratorState>({
    sets: [],
    activeSetId: null,
    discountCodes: {},
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('configurator-state');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setState({
            ...parsed,
            sets: parsed.sets.map((set: any) => ({
              ...set,
              createdAt: new Date(set.createdAt),
            })),
          });
          return; // Early return if successful
        } catch (error) {
          console.error('Failed to parse saved configuration:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load saved configuration:', error);
    }
    
    // Create initial configuration set if no saved data or on error
    const initialSet: ConfigurationSet = {
      id: `set-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Configuration 1',
      products: [],
      createdAt: new Date(),
    };

    setState(prev => ({
      ...prev,
      sets: [initialSet],
      activeSetId: initialSet.id,
    }));
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem('configurator-state', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save configuration to localStorage:', error);
    }
  }, [state]);

  const generateSetName = useCallback((existingSets: ConfigurationSet[]) => {
    const nextNumber = existingSets.length + 1;
    return `Configuration ${nextNumber}`;
  }, []);

  const addSet = useCallback(() => {
    const newSet: ConfigurationSet = {
      id: `set-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: generateSetName(state.sets),
      products: [],
      createdAt: new Date(),
    };

    setState(prev => ({
      ...prev,
      sets: [...prev.sets, newSet],
      activeSetId: newSet.id,
    }));

    return newSet.id;
  }, [state.sets, generateSetName]);

  const deleteSet = useCallback((setId: string) => {
    setState(prev => {
      const newSets = prev.sets.filter(set => set.id !== setId);
      const newActiveSetId = prev.activeSetId === setId 
        ? (newSets.length > 0 ? newSets[0].id : null)
        : prev.activeSetId;

      return {
        ...prev,
        sets: newSets,
        activeSetId: newActiveSetId,
      };
    });
  }, []);

  const updateSet = useCallback((setId: string, updates: Partial<ConfigurationSet>) => {
    setState(prev => ({
      ...prev,
      sets: prev.sets.map(set => 
        set.id === setId ? { ...set, ...updates } : set
      ),
    }));
  }, []);

  const duplicateSet = useCallback((setId: string) => {
    const originalSet = state.sets.find(set => set.id === setId);
    if (!originalSet) return;

    const newSet: ConfigurationSet = {
      ...originalSet,
      id: `set-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${originalSet.name} (Copy)`,
      createdAt: new Date(),
    };

    setState(prev => ({
      ...prev,
      sets: [...prev.sets, newSet],
      activeSetId: newSet.id,
    }));

    return newSet.id;
  }, [state.sets]);

  const setActiveSet = useCallback((setId: string) => {
    setState(prev => ({
      ...prev,
      activeSetId: setId,
    }));
  }, []);

  const addProductToSet = useCallback((setId: string, product: ConfiguredProduct) => {
    setState(prev => ({
      ...prev,
      sets: prev.sets.map(set => 
        set.id === setId 
          ? { ...set, products: [...set.products, product] }
          : set
      ),
    }));
  }, []);

  const removeProductFromSet = useCallback((setId: string, productIndex: number) => {
    setState(prev => ({
      ...prev,
      sets: prev.sets.map(set => 
        set.id === setId 
          ? { 
              ...set, 
              products: set.products.filter((_, index) => index !== productIndex) 
            }
          : set
      ),
    }));
  }, []);

  const updateProductInSet = useCallback((setId: string, productIndex: number, product: ConfiguredProduct) => {
    setState(prev => ({
      ...prev,
      sets: prev.sets.map(set => 
        set.id === setId 
          ? {
              ...set,
              products: set.products.map((p, index) => 
                index === productIndex ? product : p
              ),
            }
          : set
      ),
    }));
  }, []);

  const getActiveSet = useCallback(() => {
    return state.sets.find(set => set.id === state.activeSetId) || null;
  }, [state.sets, state.activeSetId]);

  const getAllProducts = useCallback(() => {
    return state.sets.flatMap(set => set.products);
  }, [state.sets]);

  const getTotalPrice = useCallback(() => {
    return getAllProducts().reduce((total, product) => 
      total + (product.price * product.quantity), 0
    );
  }, [getAllProducts]);

  return {
    state,
    sets: state.sets,
    activeSetId: state.activeSetId,
    activeSet: getActiveSet(),
    addSet,
    deleteSet,
    updateSet,
    duplicateSet,
    setActiveSet,
    addProductToSet,
    removeProductFromSet,
    updateProductInSet,
    getAllProducts,
    getTotalPrice,
  };
}
