import React from 'react';

type TileMap = number[][];

type TileGridProps = {
  tiles: TileMap,
  isEditing?: boolean,
  onClickTile: (x: number, y: number) => void,
};

export function TileGrid({ tiles, isEditing, onClickTile }: TileGridProps) {
  return (
    <div style={{
      display: 'inline-block',
      margin: 20,
      borderBottom: isEditing ? '1px solid black' : undefined,
      borderRight: isEditing ? '1px solid black' : undefined,
    }}>
      {tiles.map((row, y) =>
        <div key={y} style={{ lineHeight: 0 }}>
          {row.map((tile, x) =>
            <Tile
              key={x}
              value={tile}
              isEditing={isEditing}
              onClick={() => onClickTile(x, y)}
            />
          )}
        </div>
      )}
    </div>
  );
}

type TileProps = {
  value: number,
  isEditing?: boolean,
  onClick: () => void,
};

function Tile({ value, isEditing, onClick }: TileProps) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-block',
        width: 20,
        height: 20,
        margin: 0,
        padding: 0,
        lineHeight: 0,
        background: value ? 'black' : undefined,
        borderTop: isEditing ? '1px solid black' : undefined,
        borderLeft: isEditing ? '1px solid black' : undefined,
      }}
    />
  );
}
