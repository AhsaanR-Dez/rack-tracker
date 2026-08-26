import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as equipmentApi from "../api/equipment";
import * as racksApi from "../api/racks";
import type { CreateEquipmentInput, CreateRackInput } from "../types";

export const queryKeys = {
  racks: ["racks"] as const,
  equipment: ["equipment"] as const,
};

export function useRacks() {
  return useQuery({ queryKey: queryKeys.racks, queryFn: racksApi.fetchRacks });
}

export function useEquipment() {
  return useQuery({ queryKey: queryKeys.equipment, queryFn: equipmentApi.fetchEquipment });
}

export function useCreateRack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRackInput) => racksApi.createRack(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.racks });
    },
  });
}

export function useDeleteRack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => racksApi.deleteRack(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.racks });
    },
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEquipmentInput) => equipmentApi.createEquipment(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.equipment });
    },
  });
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => equipmentApi.deleteEquipment(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.equipment });
    },
  });
}
