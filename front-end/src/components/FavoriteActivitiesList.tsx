import { ActivityFragment } from "@/graphql/generated/types";
import { useFavoriteActivities } from "@/hooks";
import { useGlobalStyles } from "@/utils";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ActionIcon, Box, Button, Flex, Image, Text } from "@mantine/core";
import { IconGripVertical, IconX } from "@tabler/icons-react";
import Link from "next/link";

interface SortableItemProps {
  activity: ActivityFragment;
  onRemove: (id: string) => void;
}

function SortableItem({ activity, onRemove }: SortableItemProps) {
  const { classes } = useGlobalStyles();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: "100%",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Flex
        align="flex-start"
        gap="sm"
        sx={{ width: "100%", backgroundColor: "white" }}
      >
        <ActionIcon
          {...attributes}
          {...listeners}
          variant="subtle"
          color="gray"
          sx={{ cursor: "grab", flexShrink: 0, marginTop: 4 }}
        >
          <IconGripVertical size="1rem" />
        </ActionIcon>
        <Image
          src="https://dummyimage.com/80"
          radius="md"
          alt="activity"
          height={80}
          width={80}
          sx={{ flexShrink: 0 }}
        />
        <Flex
          direction="column"
          gap={4}
          sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}
        >
          <Text size="sm" color="dimmed" className={classes.ellipsis}>
            {activity.city}
          </Text>
          <Text weight={500} className={classes.ellipsis}>
            {activity.name}
          </Text>
          <Text size="sm" color="dimmed" className={classes.ellipsis}>
            {activity.description}
          </Text>
          <Text size="sm" weight="bold">{`${activity.price}€/j`}</Text>
          <Box>
            <Link href={`/activities/${activity.id}`} className={classes.link}>
              <Button variant="outline" color="dark" size="xs" mt={4}>
                Voir plus
              </Button>
            </Link>
          </Box>
        </Flex>
        <ActionIcon
          onClick={() => onRemove(activity.id)}
          color="red"
          variant="subtle"
          size="sm"
          sx={{ flexShrink: 0, marginTop: 4 }}
        >
          <IconX size="1rem" />
        </ActionIcon>
      </Flex>
    </div>
  );
}

export function FavoriteActivitiesList() {
  const { getAll, remove, reorder } = useFavoriteActivities();
  const favorites = getAll();
  const favoriteIds = favorites.map((a) => a.id);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = favoriteIds.indexOf(active.id as string);
    const newIndex = favoriteIds.indexOf(over.id as string);

    return reorder(arrayMove(favoriteIds, oldIndex, newIndex));
  };

  if (!favorites.length)
    return <Text color="dimmed">Aucune activité favorite pour le moment.</Text>;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={favoriteIds}
        strategy={verticalListSortingStrategy}
      >
        <Flex direction="column" gap="md" sx={{ width: "100%" }}>
          {favorites.map((activity) => (
            <SortableItem
              key={activity.id}
              activity={activity}
              onRemove={remove}
            />
          ))}
        </Flex>
      </SortableContext>
    </DndContext>
  );
}
